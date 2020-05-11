export EXPORTED_FUNCTIONS="[ \
    '_initDecoder', \
    '_decodeOnePacket', \
    '_closeDecoder' \
]"
#  -s std=c++11
emcc ./avio_reading.c C:/Users/huyunhe/Documents/ffmpeglib/ffmpeg-4.0.2/libavformat/libavformat.a C:/Users/huyunhe/Documents/ffmpeglib/ffmpeg-4.0.2/libavcodec/libavcodec.a C:/Users/huyunhe/Documents/ffmpeglib/ffmpeg-4.0.2/libavutil/libavutil.a -I C:/Users/huyunhe/Documents/ffmpeglib/ffmpeg-4.0.2/ -o avio_reading.js -s EXPORTED_FUNCTIONS="['_initDecoder', '_decodeOnePacket', '_closeDecoder']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY="134217728" -s EXTRA_EXPORTED_RUNTIME_METHODS="['addFunction']" -s RESERVED_FUNCTION_POINTERS=14
echo "Finish Build"