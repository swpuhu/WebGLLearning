#include <math.h>
#include <stdio.h>
#define PI 3.1415926
typedef struct
{
    float re; // really
    float im; // imaginary
} complex, *pcomplex;

complex complexAdd(complex a, complex b)
{
    complex ret;
    ret.re = a.re + b.re;
    ret.im = a.im + b.im;
    return ret;
}

complex complexMult(complex a, complex b)
{
    complex ret;
    ret.re = a.re * b.re - a.im * b.im;
    ret.im = a.im * b.re + a.re * b.im;
    return ret;
}

void DFT(complex x[], complex X[], int N)
{
    int k, n;
    complex Wnk;
    for (k = 0; k < N; k++)
    {
        X[k].re = 0;
        X[k].im = 0;
        for (n = 0; n < N; n++)
        {
            Wnk.re = (float)cos(2 * PI * k * n / N);
            Wnk.im = (float)-sin(2 * PI * k * n / N);
            X[k] = complexAdd(X[k], complexMult(x[n], Wnk));
        }
    }
}

void IDFT(complex X[], complex x[], int N)
{
    int k, n;
    float im = 0;
    complex ejw;
    for (k = 0; k < N; k++)
    {
        x[k].re = 0;
        x[k].im = 0;
        for (n = 0; n < N; n++)
        {
            ejw.re = (float)cos(2 * PI * k * n / N);
            ejw.im = (float)sin(2 * PI * k * n / N);
            x[k] = complexAdd(x[k], complexMult(X[n], ejw));
        }
        x[k].re /= N;
        x[k].im /= N;
    }
}

int main()
{
    complex samples[10], _out[10];
    int i;
    for (i = 0; i < 10; i++)
    {
        samples[i].re = sin(i * PI / 180);
        samples[i].im = 0;
    }
    printf("DFT:\n");
    DFT(samples, _out, 10);
    for (i = 0; i < 10; i++)
    {
        printf("(%f,%f)\n", _out[i].re, _out[i].im);
    }
    printf("IDFT:\n");
    IDFT(_out, samples, 10);
    for (i = 0; i < 10; i++)
    {
        printf("(%f,%f)\n", samples[i].re, samples[i].im);
    }
    system("pause");
}