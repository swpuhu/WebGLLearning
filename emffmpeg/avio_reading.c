#include <libavformat/avformat.h>
#include <stdio.h>

typedef void(*VideoCallback)(uint8_t *buff, int width, int height);

typedef struct WebDecoder {
    AVFormatContext *fmt_ctx;
    AVIOContext *avio_ctx;
    AVCodec *codec;
    AVCodecContext *av_ctx;
    AVStream *stream;
    AVPacket pkt;
    AVFrame *frame;
    VideoCallback videoCallback;
    int initialized;
    int stream_index;
    uint8_t *yuvData;
} WebDecoder;

WebDecoder *decoder = NULL;


struct buffer_data {
    uint8_t *ptr;
    size_t size;
};

void saveYUVData(AVFrame *frame);

static int read_packet(void *opaque, uint8_t *buf, int buf_size)
{
    struct buffer_data *bd = (struct buffer_data *)opaque;
    buf_size = FFMIN(buf_size, bd->size);
    if (!buf_size)
    {
        return AVERROR_EOF;
    }
    printf("ptr: %p size %zu\n", bd->ptr, bd->size);
    memcpy(buf, bd->ptr, buf_size);
    bd->ptr += buf_size;
    bd->size -= buf_size;
    return buf_size;
}


void decode(AVCodecContext *avctx, AVFrame *frame, AVPacket *pkt) {
    int ret = avcodec_send_packet(avctx, pkt);
    if (ret < 0) 
    {
        fprintf(stderr, "Error sending a packet for decoding\n");
        exit(1);
    }

    while(ret >= 0)
    {
        ret = avcodec_receive_frame(avctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
        {
            return;
        }
        else if (ret < 0)
        {
            fprintf(stderr, "Error during decoding\n");
            exit(1);
        }
        printf("Saving frame %3d\n", avctx->frame_number);
        saveYUVData(decoder->frame);
        fflush(stdout);
    }
}

int initDecoder (uint8_t *buffer, size_t buf_size, long videoCallback)
{
    decoder = (WebDecoder*)malloc(sizeof(WebDecoder));
    decoder->fmt_ctx = avformat_alloc_context();
    decoder->initialized = 0;
    decoder->videoCallback = (VideoCallback)videoCallback;
    size_t avio_ctx_buffer_size = 4096;
    uint8_t *avio_ctx_buffer = NULL;
    struct buffer_data bd = {0};
    int ret;
    bd.size = buf_size;
    bd.ptr = buffer;
    if (!decoder->fmt_ctx)
    {
        ret = AVERROR(ENOMEM);
        goto end;
    }

    avio_ctx_buffer = av_malloc(avio_ctx_buffer_size);
    if (!avio_ctx_buffer)
    {
        ret = AVERROR(ENOMEM);
        goto end;
    }
    decoder->avio_ctx = avio_alloc_context(avio_ctx_buffer, avio_ctx_buffer_size, 0, &bd, &read_packet, NULL, NULL);
    if (!decoder->avio_ctx)
    {
        ret = AVERROR(ENOMEM);
        goto end;
    }

    decoder->fmt_ctx->pb = decoder->avio_ctx;
    ret = avformat_open_input(&decoder->fmt_ctx, NULL, NULL, NULL);
    if (ret < 0)
    {
        fprintf(stderr, "Could not open input\n");
        exit(1);
    }

    ret = avformat_find_stream_info(decoder->fmt_ctx, NULL);
    if (ret < 0)
    {
        fprintf(stderr, "Could not find stream info\n");
        goto end;
    }

    av_dump_format(decoder->fmt_ctx, 0, NULL, 0);

    decoder->stream_index = av_find_best_stream(decoder->fmt_ctx, AVMEDIA_TYPE_VIDEO, -1, -1, NULL, 0);
    if (decoder->stream_index < 0)
    {
        fprintf(stderr, "Could not find video stream");
        exit(1);
    }
    decoder->stream = decoder->fmt_ctx->streams[decoder->stream_index];

    decoder->codec = avcodec_find_decoder(decoder->stream->codecpar->codec_id);
    if (!decoder->codec)
    {
        fprintf(stderr, "Could not find decoder!\n");
        exit(1);
    }

    decoder->frame = av_frame_alloc();
    if (!decoder->frame)
    {
        ret = AVERROR(ENOMEM);
        goto end;
    }

    decoder->av_ctx = avcodec_alloc_context3(decoder->codec);
    if (!decoder->av_ctx)
    {
        fprintf(stderr, "Could not allocate avcodec context\n");
        exit(1);
    }

    ret = avcodec_parameters_to_context(decoder->av_ctx, decoder->stream->codecpar);

    if (ret < 0)
    {
        fprintf(stderr, "Could not copy parameter to codec context\n");
        exit(1);
    }
    
    ret = avcodec_open2(decoder->av_ctx, decoder->codec, NULL);
    if (ret < 0) 
    {
        fprintf(stderr, "Could not open decoder\n");
        exit(1);
    }
end:
    if (ret < 0)
    {
        fprintf(stderr, "Error Occurred: %s\n", av_err2str(ret));
        return -1;
    }
    decoder->initialized = 1;
    return 0;
}


void saveYUVData(AVFrame *frame)
{
    int width = frame->width;
    int height = frame->height;
    int i = 0;
    decoder->yuvData = (uint8_t*)malloc(sizeof(uint8_t) * width * height * 3 / 2);
    uint8_t *dst = decoder->yuvData;
    for (i = 0; i < height; i++) 
    {
        memcpy(dst, frame->data[0] + i * frame->linesize[0], width);
        dst += width;
    }

    for (i = 0; i < height / 2; i++) {
        memcpy(dst, frame->data[1] + i * frame->linesize[1], width / 2);
        dst += width / 2;
    }

    for (i = 0; i < height / 2; i++) {
        memcpy(dst, frame->data[2] + i * frame->linesize[2], width / 2);
        dst += width / 2;
    }
    decoder->videoCallback(decoder->yuvData, width, height);
    free(decoder->yuvData);
}

int decodeOnePacket()
{
    AVPacket pkt;
    int ret;
    printf("decoding one packet\n");
    ret = av_seek_frame(decoder->fmt_ctx, -1, (int64_t)(2.5 * AV_TIME_BASE), AVSEEK_FLAG_ANY);

    // if (ret < 0)
    // {
    //     fprintf(stderr, "Error seeking");
    // }
    while (av_read_frame(decoder->fmt_ctx, &decoder->pkt) >= 0)
    {
        printf("get frame\n");
        if (decoder->pkt.stream_index !=  decoder->stream_index) 
        {
            printf("this stream is not video stream\n");
            av_packet_unref(&decoder->pkt);
            continue;
        }

        decode(decoder->av_ctx, decoder->frame, &decoder->pkt);
        // ret = avcodec_send_packet(decoder->av_ctx, &decoder->pkt);
        // if (ret < 0)
        // {
        //     fprintf(stderr, "Error sending a packet for decoding\n");
        //     exit(1);
        // }

        // while(ret >= 0)
        // {
        //     ret = avcodec_receive_frame(decoder->av_ctx, decoder->frame);
        //     if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
        //     {
        //         fprintf(stderr, "packet end\n");
        //         return 1;
        //     }
        //     else if (ret < 0)
        //     {
        //         fprintf(stderr, "Error during decoding\n");
        //         exit(1);
        //     }

        //     printf("Decoding frame %3d\n", decoder->av_ctx->frame_number);
        //     saveYUVData(decoder->frame);;
        // }
    }
    av_packet_unref(&decoder->pkt);
    return 0;
}


int closeDecoder () {
    avformat_close_input(&decoder->fmt_ctx);
    if (decoder->avio_ctx)
    {
        av_freep(&decoder->avio_ctx->buffer);
    }
    avio_context_free(&decoder->avio_ctx);
    return 0;
}



int main (int argc, char **argv)
{
    if (argc < 2)
    {
        printf("Usage: <input file>");
        exit(1);
    }

    char* filename = argv[1];
    FILE *f;
    f = fopen(filename, "rb");
    fseek(f, 0, SEEK_END);
    long file_size = ftell(f);
    fseek(f, 0, SEEK_SET);
    file_size = file_size / 2;
    uint8_t *buffer = (uint8_t*)malloc(sizeof(uint8_t) * file_size);
    fread(buffer, file_size, 1, f);
    fclose(f);
    printf("file size: %zu\n", file_size);
    initDecoder(buffer, file_size, 0);
    // seek(2.0);
    decodeOnePacket();
    

}