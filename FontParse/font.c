#include<ft2build.h>
#include<freetype/freetype.h>
#include<stdint.h>

struct font_info {
    FT_Short underline_position;
    FT_Short underline_thickness;
    FT_String* family_name;
    FT_String* style_name;
};

struct font_info ret;


int read_font(uint8_t* buffer, size_t size)
{
    FT_Library library;
    FT_Face face;
    FT_Error error;

    error = FT_Init_FreeType(&library);
    if (error)
    {
        printf("cannot init freetype\n");
        return -1;
    }

    error = FT_New_Memory_Face(library, buffer, size, 0, &face);
    if (error)
    {
        printf("cannot open font files\n");
        return -1;
    }

    return &ret;
}
