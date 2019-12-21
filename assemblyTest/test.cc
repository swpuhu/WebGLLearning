#include<math.h>
#include<stdlib.h>
#define PI 3.1415926
extern "C" 
{
    
    double* points = (double*)malloc(sizeof(double) * 2);
    double* rotate(double x, double y, double angle) {
        double rad = angle * PI / 180.0;
        double cosValue = cos(rad);
        double sinValue = sin(rad);
        double _x = x * cosValue - y * sinValue;
        double _y = x * sinValue + y * cosValue;
        *points = _x;
        *(points + 1) = _y;
        return points;
    }

}