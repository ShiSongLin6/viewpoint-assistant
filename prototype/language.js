/* Interface language only: prompt content and parser vocabulary stay in English. */
(function () {
  'use strict';
  var language = 'en';
  try { language = localStorage.getItem('viewpoint-language') === 'zh' ? 'zh' : 'en'; } catch (e) {}
  var pairs = [
    ['Reset view','重置视图'],['Compact','紧凑布局'],['Place the camera view beside the result and versions','把相机视图放到结果和版本旁边'],['Drag the cat to orbit the camera, or drag the light to change illumination. The inset stays in sync.','拖动小猫环绕相机，或拖动光源改变照明。小图同步变化。'],['Drag to turn the globe and bring the far side into view. The camera angle stays fixed.','拖动以转动球体，把背面转到眼前；相机角度保持不变。'],['Point or drag on the visible globe, or drag the preview, to move the camera.','在可见球面上点选或拖动，或拖动预览，来移动相机。'],['Drag the light around the subject, or use the light sliders.','围绕主体拖动光源，或使用光源滑块。'],['Camera view reset. Light position is unchanged.','相机取景已重置，光源位置保持不变。'],['Sphere view reset. Camera and light positions are unchanged.','球体视图已重置，相机与光源位置保持不变。'],
    ['Expand inset view','放大此视图'],['Secondary view','辅助视图'],['Camera sphere · drag or select a point','相机球体 · 拖动或选择位置'],
    ['Suggested positions: use the numbered buttons','建议位置：点击编号按钮选择'],['Choose a suggested camera position','选择建议相机位置'],['Suggestion ','建议 '],
    ['Choose Suggestion 1, 2 or 3 below the preview, or drag the cat in the preview. Then confirm the angle.','点击预览下方的建议 1、2、3，或在预览中拖动小猫，然后确认角度。'],
    ['Preview zoom','预览缩放'],['Zoom out','缩小'],['Zoom in','放大'],['Reset zoom','重置缩放'],
    ['Switch to night mode','切换夜间模式'],['Switch to day mode','切换日间模式'],['Day / night','日间／夜间'],['Light on / off','光源开／关'],
    
    ['Point light · drag on sphere','点光源 · 沿球面拖动'],['Drag the light around the sphere','沿球面拖动光源'],
    ['Point light · drag','点光源 · 拖动'],['Drag the point light to change illumination','拖动点光源调整照明'],
    ['Drag the point light in the large preview, drag its marker in the inset, or use the light sliders for full 360° placement.','可拖动大图中的点光源、小球中的光源标记，或使用滑块进行 360° 定位。'],
    ['Camera and light controls','相机与光源设置'],['Adjust light: drag the view or use the sliders','调整光源：拖动画面或使用滑块'],
    ['Adjust light','调整光源'],['Light position','光源位置'],['Light direction (0–360°)','光源方向（0–360°）'],['Light height (−90° to +90°)','光源高度（−90° 至 +90°）'],
    ['Light mode: click or drag on the globe to position the light. Rotate the globe or use the light sliders to reach any direction.','光源模式：点击或拖动球面放置光源。旋转球体或使用光源滑块，可到达任意方向。'],
    ['Camera view','相机取景'],['Live camera preview','实时相机预览'],['Camera sphere inset','球体画中画'],
    ['Live 3D cat camera preview. Drag or use arrow keys to orbit the cat.','实时三维猫取景画面。拖动或使用方向键，绕猫调整相机。'],
    ['Drag the cat view to orbit the camera. The inset sphere follows the same camera angle; changes are saved as a version when you confirm.','拖动猫的画面调整相机视角，球体画中画同步显示相机角度；确认后保存为新版本。'],
    ['Auto','自动'],
    ['Rotate mode: dragging only rotates the globe. Your selected camera angle stays fixed.','旋转模式：拖动只旋转球体，已选相机角度保持不变。'],
    ['Camera mode: click or drag on the visible globe to adjust the camera. The globe view stays fixed.','相机模式：点击或拖动可见球面调整相机，球体视图保持不变。'],
    ['Major lines','主线'],
    ['Drag the globe to rotate it; drag the camera icon to adjust its position. Click the globe to select a point. Arrow keys rotate the view.','拖动球面旋转；拖动相机图标调整位置。点击球面选点，方向键也可旋转视图。'],
    ['Light','光源'],
    ['Longitude (θ)','经线（θ）'],['Latitude (φ)','纬线（φ）'],['Dashed = far side','虚线 = 背面'],['Camera, far side','相机（背面）'],['Camera','相机'],['Longitude lines show direction (azimuth θ)','经线表示方向（方位角 θ）'],['Latitude lines show height (elevation φ)','纬线表示高度（仰角 φ）'],['Dashed lines are on the far side of the globe','虚线位于球体背面'],['Camera on the far side of the globe','位于球体背面的相机'],['Globe grid legend','球体经纬线图例'],
    ['Enter prompts in English; the language switch changes the interface.','请用英文输入提示词；语言按钮用于切换界面语言。'],
    ['Viewpoint Assistant — prototype','视角助手 — 原型'],['Viewpoint Assistant','视角助手'],
    ['Get a generated image from the camera angle you mean: the assistant checks the angle for you, and asks instead of guessing.','从你想要的相机角度生成图像：助手核对角度，遇到不明确的描述会先询问你。'],
    ['prompt reading (rules), comparison, 360° sphere, confirm before generating, version history','提示词解析（规则）、角度比较、360° 球体、生成前确认、版本历史'],
    ['image generation and viewpoint detection — no AI model is called; the “image” is a placeholder 3D render','图像生成和视角检测为模拟；未调用 AI 模型，图像为三维占位渲染'],
    ['implemented','已实现'],['simulated detector','模拟检测器'],['simulated model','模拟模型'],['simulated','模拟'],
    ['Your prompt','你的提示词'],['Describe the image, including the camera angle you want…','请用英文描述图像和所需相机角度…'],['Prompt','提示词（英文）'],['Generate','生成'],['or try:','或试试：'],
    ['A · top-down','A · 俯视'],['B · “from the stage”','B · “从舞台上”'],['C · low ¾ rear','C · 低角度 ¾ 后方'],
    ['What the assistant understood','助手的理解'],['You asked for','你要求的角度'],['The image shows','图像显示的角度'],['Check','核对结果'],['waiting for a prompt','等待输入提示词'],
    ['Type a prompt and press Generate. Nothing is generated from an unclear angle, and nothing is regenerated until you confirm.','输入英文提示词并点击“生成”。角度不明确时会先询问你，重新生成前需要你的确认。'],
    ['Camera sphere','相机球体'],['Adjust camera','调整相机'],['Rotate sphere','旋转球体'],['Reset sphere view','重置球体视图'],['Result','结果'],['No image yet.','暂无图像。'],
    ['camera','相机'],['Direction (azimuth θ)','方向（方位角 θ）'],['Height (elevation φ)','高度（仰角 φ）'],['In plain words:','通俗描述：'],['Direction θ (0–360°)','方向 θ（0–360°）'],['Height φ (−90° to +90°)','高度 φ（−90° 至 +90°）'],
    ['Shortcuts','快捷角度'],['Top-down','俯视'],['Eye-level front','正面平视'],['Three-quarter','四分之三视角'],['Side','侧面'],['Back','背面'],['Confirm angle → generate','确认角度 → 生成'],['Confirm angle → regenerate','确认角度 → 重新生成'],['Undo move','撤销调整'],['Keep this image','保留这张图像'],
    ['Adjust camera: point on the visible sphere to select an angle. Rotate sphere: drag to bring the far side into view. Arrow keys also rotate the view in that mode. Sliders adjust the selected camera angle.','调整相机：在可见球面上选择角度。旋转球体：拖动球体将背面转到眼前，也可用方向键旋转。滑块用于微调相机角度。'],
    ['Drag the globe or use arrow keys on it to reveal the far side. Your selected camera angle stays fixed.','拖动球体，或聚焦球体后使用方向键，将背面转到眼前。已选相机角度保持不变。'],
    ['Point on the visible sphere to select a camera angle. Rotate the globe first to reach the far side.','在可见球面上选择相机位置。要选择背面位置，请先旋转球体。'],
    ['Drag the camera marker, use the sliders, or pick a shortcut. The subject sits at the centre, facing you.','拖动相机标记、使用滑块或选择快捷角度。主体位于球体中心。'],
    ['Versions','版本历史'],['Each generation is kept here so you can compare angles and go back.','每次生成都保留在这里，便于比较角度和返回旧版本。'],
    ['Simulation settings (for demonstrating the prototype)','模拟设置（用于演示原型）'],['When generating from text only, the simulated model','仅根据文字生成时，模拟模型'],['ignores viewpoint words (returns its default angle)','忽略视角描述（返回默认角度）'],['follows viewpoint words','遵循视角描述'],
    ['The default reproduces the failure this project is about: models often return a similar orientation whatever angle the prompt states. When an angle is confirmed on the sphere, the simulated model always renders exactly that angle, standing in for a camera-controllable model. The simulated detector reads the angle of the placeholder render, so it is never wrong here; a real detector could be.','默认设置演示本项目关注的问题：无论提示词指定什么角度，模型往往返回相似朝向。在球体上确认角度后，模拟模型按该角度渲染，以演示可控相机生成流程。模拟检测器直接读取占位渲染的角度，因此这里不会检测出错；实际检测器可能出错。'],
    ['Please type a prompt first.','请先输入英文提示词。'],['Please type a prompt first; the angle is added to it when you confirm.','请先输入英文提示词；确认后会附加所选角度。'],['Nothing to undo.','没有可撤销的调整。'],
    ['Amber rings are suggestions near the likely angle. Tap one, or drag the marker anywhere.','橙色圆环是建议位置。点击选择，或拖动相机标记调整。'],
    ['no camera angle','未指定相机角度'],['I found no viewpoint word in the prompt.','提示词中没有找到视角词。'],['an angle I cannot pin down','无法确定的角度'],['nothing yet','尚未生成'],['I did not generate an image from an unclear angle.','角度不明确，因此尚未生成图像。'],['I did not pick an angle for you.','尚未替你选择角度。'],
    ['Which camera angle do you want?','你希望使用哪个相机角度？'],['Your prompt has no viewpoint word, and I won’t guess one. Set the angle on the sphere (or add a word such as “top-down” or “side view” to the prompt), then press','提示词中没有视角词。请在球体上选择角度，或在英文提示词中加入“top-down”“side view”等描述，然后点击'],
    ['I can’t map that phrase to one exact angle, so I have not generated anything.','这句话无法对应唯一角度，因此尚未生成图像。'],['Please choose one of the','请从预览下方的'],['numbered suggestions below the preview (they are also marked on the sphere), or drag the cat in the preview, then press','个编号建议中选择一个（它们也标在球体上），或在预览中拖动小猫，然后点击'],
    ['The image matches the angle you asked for.','图像符合你要求的角度。'],['You can still fine-tune on the sphere and confirm to make another version.','仍可在球体上微调，确认后生成新版本。'],['The image is not at the angle you asked for.','图像不符合你要求的角度。'],['It shows','图像显示'],['you asked for','你要求的是'],['I moved the camera marker to','已将相机标记移至'],['on the sphere. Check it, adjust if you like, then confirm. Nothing is regenerated until you do.','。请检查、调整并确认，再重新生成。'],
    ['Detected:','检测结果：'],['earlier image · nothing new generated yet','上一张图像 · 尚未生成新图像'],['✓ matches request','✓ 符合要求'],['✕ not the angle asked for','✕ 角度不符'],['✓ match','✓ 一致'],['✕ mismatch','✕ 不一致'],['waiting','等待'],['mismatch','不一致'],['match','一致'],['ambiguous','角度不明确'],['no viewpoint','未指定视角'],
    ['Still showing the earlier image.','仍显示上一张图像。'],['generated from','生成依据：'],['the text prompt only','仅文字提示词'],['the angle confirmed on the sphere','球体上确认的角度'],['Version','版本'],['from text','来自文字'],['from sphere','来自球体'],['Show version','显示版本'],['Showing','正在显示'],['version','版本'],
    ['The camera marker is back at this version’s angle; adjust it and confirm to make a new version from here.','相机已返回该版本的角度，可调整并确认以生成新版本。'],['Generated version','已生成版本'],['at the confirmed angle.','，使用已确认角度。'],['The camera parameters were sent with the prompt','相机参数随提示词一起传入'],['Earlier versions stay in the list below; pick one to go back.','旧版本保留在下方列表，点击即可返回。'],['Kept version','已保留版本'],['as it is. The sphere is still available if you change your mind.','。之后仍可在球体上调整角度。'],
    ['confirmed on the sphere → direction θ','球体确认 → 方向 θ'],['from the words','匹配词'],['direction left open','方向未指定'],['height left open','高度未指定'],['direction θ','方向 θ'],['height φ','高度 φ'],['Suggestion selected:','已选择建议：'],['Confirm to generate, or keep adjusting.','确认生成，或继续调整。'],['Shortcut:','快捷角度：'],['Confirm to generate, or fine-tune first.','确认生成，或先微调。'],['Undone: camera back at','已撤销，相机返回'],
    ['top-down view','俯视视角'],['bottom-up view','仰视视角'],['three-quarter rear view','后侧四分之三视角'],['three-quarter front view','前侧四分之三视角'],['front-right','前右侧'],['front-left','前左侧'],['back-right','后右侧'],['back-left','后左侧'],['right side','右侧'],['left side','左侧'],['slightly high angle','略高角度'],['slightly low angle','略低角度'],['high angle','高角度'],['low angle','低角度'],['eye-level','平视'],['top-down','俯视'],['bottom-up','仰视'],['front view','正面视角'],['back view','背面视角'],['view','视角'],['subject','主体'],['selected camera:','已选相机：'],['FRONT','正面'],['BACK','背面'],['RIGHT','右侧'],['LEFT','左侧'],['ABOVE','上方']
  ].sort(function (a,b) { return b[0].length-a[0].length; });
  function translate(text) {
    if (language !== 'zh') return text;
    // Replace in a single pass so translated fragments are never translated twice.
    var pattern = new RegExp(pairs.map(function(p){return p[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|'),'g');
    return text.replace(pattern,function(s){ for(var i=0;i<pairs.length;i++) if(pairs[i][0]===s)return pairs[i][1]; return s; });
  }
  var nativeFillText = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    return maxWidth === undefined ? nativeFillText.call(this, translate(String(text)), x, y) : nativeFillText.call(this, translate(String(text)), x, y, maxWidth);
  };
  var originals = new WeakMap(), observer;
  function localize() {
    if (observer) observer.disconnect();
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),node;
    while((node=walker.nextNode())) {
      if (node.parentElement.closest('script, style, textarea, #languageToggle')) continue;
      var saved=originals.get(node);
      if(!saved || node.nodeValue!==saved.rendered) saved={source:node.nodeValue};
      saved.rendered=translate(saved.source); originals.set(node,saved);
      if(node.nodeValue!==saved.rendered) node.nodeValue=saved.rendered;
    }
    document.querySelectorAll('[aria-label], [placeholder], [title]').forEach(function(el){
      if(el.closest('#languageToggle')) return;
      ['aria-label','placeholder','title'].forEach(function(attr){
        if(!el.hasAttribute(attr)) return;
        var key='data-en-'+attr;
        if(!el.hasAttribute(key)) el.setAttribute(key,el.getAttribute(attr));
        el.setAttribute(attr,translate(el.getAttribute(key)));
      });
    });
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=translate('Viewpoint Assistant — prototype');
    document.getElementById('languageToggle').setAttribute('aria-label',language==='zh'?'Switch to English':'切换到中文');
    if(observer) observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  window.ViewpointLanguage={text:translate};
  document.addEventListener('DOMContentLoaded',function(){
    observer=new MutationObserver(localize);
    document.getElementById('languageToggle').addEventListener('click',function(){
      language=language==='zh'?'en':'zh';
      try{localStorage.setItem('viewpoint-language',language);}catch(e){}
      document.dispatchEvent(new Event('viewpoint-language-change'));
      localize();
    });
    localize();
  });
})();
