#include <libavutil/log.h>

int main () {
    av_log_set_level(AV_LOG_INFO);
    av_log(NULL, AV_LOG_ERROR, "Hello FFmpeg + WebAssembly!\n");
    return 0;
}