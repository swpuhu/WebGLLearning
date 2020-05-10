export EXPORTED_FUNCTIONS="[ \
    '_initDecoder', \
    '_decodeOnePacket', \
    '_closeDecoder' \
]"
export TOTAL_MEMORY=134217728
#  -s std=c++11
emcc ./avio_reading.c \
    /usr/local/ffmpeg-emcc/libavformat/libavformat.a \
    /usr/local/ffmpeg-emcc/libavcodec/libavcodec.a \
    /usr/local/ffmpeg-emcc/libavutil/libavutil.a \
    -I /usr/local/ffmpeg-emcc/ \
    -o avio_reading.js \
    -s EXPORTED_FUNCTIONS="${EXPORTED_FUNCTIONS}" \
    -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
    -s TOTAL_MEMORY="${TOTAL_MEMORY}" \
    -s EXTRA_EXPORTED_RUNTIME_METHODS="['addFunction']" \
    -s RESERVED_FUNCTION_POINTERS=14
echo "Finish Build"