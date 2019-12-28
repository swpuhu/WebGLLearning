#include<stdlib.h>
#include<time.h>
#include<stdio.h>
#include<string.h>

extern "C" {
    typedef unsigned int __uint32_t;
    typedef unsigned char __uint8_t;

    __uint32_t* r = (__uint32_t*)malloc(sizeof(__uint32_t) * 256);
    __uint32_t* g = (__uint32_t*)malloc(sizeof(__uint32_t) * 256);
    __uint32_t* b = (__uint32_t*)malloc(sizeof(__uint32_t) * 256);
    __uint32_t* ret = (__uint32_t*)malloc(sizeof(__uint32_t) * 256 * 3);

    void analyzeHistogram(__uint32_t width, __uint32_t height, __uint8_t* data) {
        memset(r, 0, 256);
        memset(g, 0, 256);
        memset(b, 0, 256);
        for (__uint32_t y = 0; y < height; ++y) {
            for (__uint32_t x = 0; x < width * 4; x += 4) {
                ++r[data[y * width * 4 + x]];
                ++g[data[y * width * 4 + x + 1]];
                ++b[data[y * width * 4 + x + 2]];
            }
        }
        memcpy(ret, r, 256 * 4);
        memcpy(ret + 256, g, 256 * 4);
        memcpy(ret + 512, b, 256 * 4);
    }

    __uint32_t* getAddress() {
        return ret;
    }

    int main () {
        __uint8_t* data = (__uint8_t*)malloc(sizeof(__uint8_t) * 512 * 512 * 4);
        memset(data, 255, 512 * 512 * 4);
        analyzeHistogram(512, 512, data);
        printf("%d %d %d", ret[255], ret[511], ret[767]);
    }
}