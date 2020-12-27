import util from "../util.js";
import Enum_Effect from "./Enum/effectType.js";
import ColorOffsetFilter from "./colorOffset.js";
import NegativeFilter from "./negativeFilter.js";
import SketchFilter from "./sketchFilter.js";
import BeautifyFilter from "./beautify.js";
import WuhuaFilter from "./wuhua.js";
import DoubleFilter from "./2DFilter.js";
import CircleFilter from "./circleBorder.js";
import MaskFilter from "./maskFilter.js";
import BinaryFilter from "./binaryFilter.js";
import AtomizeFilter from "./atomizationFilter.js";
import Mosiac from "./mosaicFilter.js";
import RadiusLightFilter from "./radiusLightFilter.js";
import PreserveColorFilter from "./preserveColorFilter.js";
import SwirlFilter from "./swirlFilter.js";
import BallFilter from "./ballFilter.js";
import GaussianFilter from "./gaussianFilter.js";
import BlendFilter from "./blendFilter.js";
import Normal from "./normal.js";
import AntiqueFilter from "./antiqueFilter.js";
import InkWellFilter from "./inkWellFilter.js";
import MonoFilter from "./monoFilter.js";
import iOSBlurFilter from "./iOSblurFilter.js";
import Gaussian2 from "./gaussianFilter2.js";
import StencilFilter from "./stencilFilter.js";
import SunsetFilter from "./sunsetFilter.js";
import WarmFilter from "./warmFilter.js";
import GangfengFilter from "./jy-gangfeng.js";
import JueduihongFilter from "./jy-jueduihong.js";
import LengpanFilter from "./jy-lengpan.js";
import MopianFilter from "./jy-mopian.js";
import NingmengQingFilter from "./jy-ningmengqing.js";
import RiluojuFilter from "./jy-riluoju.js";
import SaiboFilter from "./jy-saibopengke.js";
import WuhouFilter from "./jy-wuhou.js";
import XiariFilter from "./jy-xiarizhongqu.js";
import XianliangFilter from "./jy-xianliang.js";
import ZhengqiboFilter from "./jy-zhengqibo.js";
import ZhongxiaFilter from "./jy-zhongxia.js";
import Jy1970Filter from "./jy-1970.js";
import BluesFilter from "./jy-blues.js";
import ChujianFilter from "./jy-chujian.js";
import ChunguangzhaxieFilter from "./jy-chunguangzhaxie.js";
import DunkeerkeFilter from "./jy-dunkeerke.js";
import FushiFilter from "./jy-fushi.js";
import HongyulanFilter from "./jy-hongyulan.js";
import JizhouFilter from "./jy-jizhou.js";
import JiangzhehuFilter from "./jy-jzh.js";
import KekouFilter from "./jy-kekou.js";
import LuoyezongFilter from "./jy-luoyezong.js";
import MujiFilter from "./jy-muji.js";
import MuseFilter from "./jy-muse.js";
import NihongguangFilter from "./jy-nihongguang.js";
import NiupizhiFilter from "./jy-niupizhi.js";
import QinkongFilter from "./jy-qingkong.js";
import QingtouFilter from "./jy-qingtou.js";
import RishiFilter from "./jy-rishi.js";
import ShangweiFilter from "./jy-shangwei.js";
import VintageFilter from "./jy-vintage.js";
import WenxiangshirenFilter from "./jy-wenxiangshiren.js";
import WushanFilter from "./jy-wushan.js";
import XioazhunFilter from "./jy-xiaozhun.js";
import YuantuFilter from "./jy-yuantu.js";
import ZiranFilter from "./jy-ziran.js";

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
export default function (canvas) {
  const gl = canvas.getContext("webgl2");
  const width = canvas.width;
  const height = canvas.height;

  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

  const points = new Float32Array([
    0,
    0,
    0,
    0,
    width,
    0,
    0,
    0,
    width,
    height,
    0,
    0,
    width,
    height,
    0,
    0,
    0,
    height,
    0,
    0,
    0,
    0,
    0,
    0,
  ]);

  for (let i = 0; i < points.length; i += 4) {
    points[i + 2] = points[i] / width;
    points[i + 3] = points[i + 1] / height;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

  const originTexture = util.createTexture(gl);
  const textures = [];
  const frameBuffers = [];
  for (let i = 0; i < 2; i++) {
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let texture = util.createTexture(gl);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
    textures.push(texture);
    frameBuffers.push(framebuffer);
  }

  const addFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, addFramebuffer);
  const addTexture = util.createTexture(gl);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    addTexture,
    0
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  const projectionMat = util.createProjection(width, height, 1);
  const colorOffsetFilter = new ColorOffsetFilter(gl, projectionMat);
  const negativeFilter = new NegativeFilter(gl, projectionMat);
  const sketchFilter = new SketchFilter(gl, projectionMat);
  const beautifyFilter = new BeautifyFilter(gl, projectionMat);
  const doubleFilter = new DoubleFilter(gl, projectionMat);
  const binaryFilter = new BinaryFilter(gl, projectionMat);
  const atomizationFilter = new AtomizeFilter(gl, projectionMat);
  // const mosicFilter = new Mosiac(gl, projectionMat);
  const radiusLightFilter = new RadiusLightFilter(gl, projectionMat);
  const preserveColorFilter = new PreserveColorFilter(gl, projectionMat);
  const swirlFilter = new SwirlFilter(gl, projectionMat);
  const gaussianFilter = new GaussianFilter(gl, projectionMat);
  const blendFilter = new BlendFilter(gl, projectionMat);
  const normal = new Normal(gl, projectionMat);
  const antiqueFilter = new AntiqueFilter(gl, projectionMat);
  const inkWellFilter = new InkWellFilter(gl, projectionMat);
  const maskFilter = new MaskFilter(gl, projectionMat);
  const monoFilter = new MonoFilter(gl, projectionMat);
  const iosBlurFilter = new iOSBlurFilter(gl, projectionMat);
  const gaussianFilter2 = new Gaussian2(gl, projectionMat);
  const stencilFilter = new StencilFilter(gl, projectionMat);
  const sunsetFilter = new SunsetFilter(gl, projectionMat);
  const warmFilter = new WarmFilter(gl, projectionMat);
  const gangfengFilter = new GangfengFilter(gl, projectionMat);
  const jueduihongFilter = new JueduihongFilter(gl, projectionMat);
  const lengpanFilter = new LengpanFilter(gl, projectionMat);
  const mopianFilter = new MopianFilter(gl, projectionMat);
  const ningmengqingFilter = new NingmengQingFilter(gl, projectionMat);
  const riluojuFilter = new RiluojuFilter(gl, projectionMat);
  const saiboFilter = new SaiboFilter(gl, projectionMat);
  const wuhouFilter = new WuhouFilter(gl, projectionMat);
  const xiariFilter = new XiariFilter(gl, projectionMat);
  const xianliangFilter = new XianliangFilter(gl, projectionMat);
  const zhengqiboFilter = new ZhengqiboFilter(gl, projectionMat);
  const zhongxiaFilter = new ZhongxiaFilter(gl, projectionMat);
  const jy1970Filter = new Jy1970Filter(gl, projectionMat);
  const bluesFilter = new BluesFilter(gl, projectionMat);
  const chujianFilter = new ChujianFilter(gl, projectionMat);
  const chunguangzhaxieFilter = new ChunguangzhaxieFilter(gl, projectionMat);
  const dunkeerkeFilter = new DunkeerkeFilter(gl, projectionMat);
  const fushiFilter = new FushiFilter(gl, projectionMat);
  const hongyulanFilter = new HongyulanFilter(gl, projectionMat);
  const jizhouFilter = new JizhouFilter(gl, projectionMat);
  const jzhFilter = new JiangzhehuFilter(gl, projectionMat);
  const kekouFilter = new KekouFilter(gl, projectionMat);
  const luoyezongFilter = new LuoyezongFilter(gl, projectionMat);
  const mujiFilter = new MujiFilter(gl, projectionMat);
  const museFilter = new MuseFilter(gl, projectionMat);
  const nihongguangFilter = new NihongguangFilter(gl, projectionMat);
  const niupizhiFilter = new NiupizhiFilter(gl, projectionMat);
  const qingkongFilter = new QinkongFilter(gl, projectionMat);
  const qingtouFilter = new QingtouFilter(gl, projectionMat);
  const rishiFilter = new RishiFilter(gl, projectionMat);
  const shangweiFilter = new ShangweiFilter(gl, projectionMat);
  const vintageFilter = new VintageFilter(gl, projectionMat);
  const wenxiangshirenFilter = new WenxiangshirenFilter(gl, projectionMat);
  const wushanFilter = new WushanFilter(gl, projectionMat);
  const xiaozhunFilter = new XioazhunFilter(gl, projectionMat);
  const yuantuFilter = new YuantuFilter(gl, projectionMat);
  const ziranFilter = new ZiranFilter(gl, projectionMat);

  const effects = {
    [Enum_Effect.NONE]: doubleFilter,
    [Enum_Effect.COLOR_OFFSET]: colorOffsetFilter,
    [Enum_Effect.NEGATIVE]: negativeFilter,
    [Enum_Effect.DOUBLE]: doubleFilter,
    [Enum_Effect.BINARY]: binaryFilter,
    [Enum_Effect.ATOMIZATION]: atomizationFilter,
    // [Enum_Effect.MOSIC]: mosicFilter,
    [Enum_Effect.RADIUS_LIGHT]: radiusLightFilter,
    [Enum_Effect.SWIRL]: swirlFilter,
    [Enum_Effect.GAUSSIAN]: gaussianFilter,
    [Enum_Effect.ANTIQUE]: antiqueFilter,
    [Enum_Effect.INKWELL]: inkWellFilter,
    [Enum_Effect.MASK]: maskFilter,
    [Enum_Effect.MONO]: monoFilter,
    [Enum_Effect.IOSBLUR]: iosBlurFilter,
    [Enum_Effect.GAUSSAIN2]: gaussianFilter2,
    [Enum_Effect.SKETCH]: sketchFilter,
    [Enum_Effect.STENCIL]: stencilFilter,
    [Enum_Effect.SUNSET]: sunsetFilter,
    [Enum_Effect.WARM]: warmFilter,
    [Enum_Effect.ANTIQUE]: antiqueFilter,
    [Enum_Effect.GANGFENG]: gangfengFilter,
    [Enum_Effect.JUEDUIHONG]: jueduihongFilter,
    [Enum_Effect.LENGPAN]: lengpanFilter,
    [Enum_Effect.MOPIAN]: mopianFilter,
    [Enum_Effect.NINGMENGQING]: ningmengqingFilter,
    [Enum_Effect.RILUOJU]: riluojuFilter,
    [Enum_Effect.SAIBO]: saiboFilter,
    [Enum_Effect.WUHOU]: wuhouFilter,
    [Enum_Effect.XIARIZHONGQU]: xiariFilter,
    [Enum_Effect.XIANLIANG]: xianliangFilter,
    [Enum_Effect.ZHENGQIBO]: zhengqiboFilter,
    [Enum_Effect.ZHONGXIA]: zhongxiaFilter,
    [Enum_Effect.JY1970]: jy1970Filter,
    [Enum_Effect.CHUJIAN]: chujianFilter,
    [Enum_Effect.CHUANGGUANGZHAXIE]: chunguangzhaxieFilter,
    [Enum_Effect.DUNKEERKE]: dunkeerkeFilter,
    [Enum_Effect.FUSHI]: fushiFilter,
    [Enum_Effect.HONGYULAN]: hongyulanFilter,
    [Enum_Effect.JIZHOU]: jizhouFilter,
    [Enum_Effect.JZH]: jzhFilter,
    [Enum_Effect.KEKOU]: kekouFilter,
    [Enum_Effect.LUOYEZONG]: luoyezongFilter,
    [Enum_Effect.MUJI]: mujiFilter,
    [Enum_Effect.MUSE]: museFilter,
    [Enum_Effect.NIHONGGUANG]: nihongguangFilter,
    [Enum_Effect.NIUPIZHI]: niupizhiFilter,
    [Enum_Effect.QINGKONG]: qingkongFilter,
    [Enum_Effect.QINGTOU]: qingtouFilter,
    [Enum_Effect.RISHI]: rishiFilter,
    [Enum_Effect.SHANGWEI]: shangweiFilter,
    [Enum_Effect.VINTAGE]: vintageFilter,
    [Enum_Effect.WENXIANGSHIREN]: wenxiangshirenFilter,
    [Enum_Effect.WUSHAN]: wushanFilter,
    [Enum_Effect.XIAOZHUN]: xiaozhunFilter,
    [Enum_Effect.YUANTU]: yuantuFilter,
    [Enum_Effect.ZIRAN]: ziranFilter,
  };

  window.effects = effects;

  let effectList = [
    // Enum_Effect.DOUBLE,
    // Enum_Effect.COLOR_OFFSET,
    // Enum_Effect.GAUSSIAN,
    // Enum_Effect.MOSIC,
    // Enum_Effect.SWIRL,
    // Enum_Effect.DOUBLE
  ];

  function drawWithEffect(effectType, count) {
    effects[effectType] && gl.useProgram(effects[effectType].program);
    if (effectType === Enum_Effect.DOUBLE) {
      let renderFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderFramebuffer);
      let renderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        8,
        gl.RGBA8,
        canvas.width,
        canvas.height
      );
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.RENDERBUFFER,
        renderbuffer
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderFramebuffer);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderFramebuffer);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffers[count % 2]);
      gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
      gl.blitFramebuffer(
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
        gl.COLOR_BUFFER_BIT,
        gl.LINEAR
      );

      gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
      gl.deleteFramebuffer(renderFramebuffer);
      gl.deleteRenderbuffer(renderbuffer);
    } else {
      if (effectType === Enum_Effect.GAUSSIAN) {
        const radius = 10;
        for (let i = 0; i < radius; i++) {
          gaussianFilter.setRadius(i);
          gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
          count++;
        }
        --count;
      } else if (effectType === Enum_Effect.GLOW) {
        gl.useProgram(gaussianFilter.program);
        let glow_radius = 5;
        gl.bindFramebuffer(gl.FRAMEBUFFER, addFramebuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, addTexture);
        for (let i = 0; i < glow_radius; i++) {
          gaussianFilter.setRadius(i);
          gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
          count++;
        }

        gl.useProgram(blendFilter.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, textures[(count - 1) % 2]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, addTexture);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
      } else {
        effects[effectType].bindMap && effects[effectType].bindMap();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[count % 2]);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
      }
    }
    return ++count;
  }

  let cacheImg;

  async function render(img) {
    if (img !== cacheImg && img) {
      cacheImg = img;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, originTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      cacheImg
    );
    let count = 0;
    let radius = 1;
    for (let i = 0; i < effectList.length; i++) {
      count = drawWithEffect(effectList[i], count);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(normal.program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  window.render = render;

  function setEffectList(value) {
    effectList = value;
  }

  return {
    render,
    setEffectList,
  };
}
