
var gl, program, program2;
var fovy = 1.4;
var eye = vec3.fromValues(-40,0,50)
var center = vec3.fromValues(0,0,0)
var up = vec3.fromValues(0,1,0)
var texturesId = [];
var lightPos1 = [12.1, 3.0, 49.5, 1.]; //firelight
var lightPos2 = [0.0, 0.0, 0.0, 1.];
var lightPos3 = [0.0, 0.0, 0.0, 1.];

function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");

  try {
    return canvas.getContext("webgl2");
  }
  catch(e) {
  }

  return null;

}

function initShaders() {
    
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
 
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  
  
    
  ///////////////////	
  // create program 1
  ///////////////////
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
    
  gl.linkProgram(program);
    
  gl.useProgram(program);
    
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
    
  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
    
  // normales
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);
    
  // coordenadas de textura
  program.vertexTexcoordsAttribute = gl.getAttribLocation ( program, "VertexTexcoords");
  gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);
  
  program.myTextureIndex           = gl.getUniformLocation( program, 'myTexture');
  program.repetition               = gl.getUniformLocation( program, "repetition");
  gl.uniform1i(program.myTextureIndex, 3);
  gl.uniform1f(program.repetition,     1.0);

  
  program.ka= gl.getUniformLocation(program, 'Material.Ka'),
  program.kd= gl.getUniformLocation(program, 'Material.Kd'),
  program.ks= gl.getUniformLocation(program, 'Material.Ks'),
  program.alpha= gl.getUniformLocation(program, 'Material.alpha')

  // material
  program.light1 = {
    position: gl.getUniformLocation(program, 'Light1.Position'),
    la: gl.getUniformLocation(program, 'Light1.La'),
    ld: gl.getUniformLocation(program, 'Light1.Ld'),
    ls: gl.getUniformLocation(program, 'Light1.Ls')
};

program.light2 = {
    position: gl.getUniformLocation(program, 'Light2.Position'),
    la: gl.getUniformLocation(program, 'Light2.La'),
    ld: gl.getUniformLocation(program, 'Light2.Ld'),
    ls: gl.getUniformLocation(program, 'Light2.Ls')
};

program.  light3 = {
    position: gl.getUniformLocation(program, 'Light3.Position'),
    la: gl.getUniformLocation(program, 'Light3.La'),
    ld: gl.getUniformLocation(program, 'Light3.Ld'),
    ls: gl.getUniformLocation(program, 'Light3.Ls')
};
    

}

function initRendering() {
    
  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.enable(gl.DEPTH_TEST);
    
  setShaderLight();
    
}

function initBuffers(model) {
    
  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
  // create the buffer for normals
  model.idBufferNormals = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
  
  // create the buffer for texture coordinates
  model.idBufferTexture = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferTexture);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertexTextureCoords), gl.STATIC_DRAW);
  
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    
}

function initPrimitives() {
    
  initBuffers(plane);
  initBuffers(tree);
  initBuffers(gingerbread);
  initBuffers(table);
  initBuffers(man);
  initBuffers(oven);
  initBuffers(hat);
  initBuffers(exampleCube)
}

function setShaderProjectionMatrix(projectionMatrix) {
    
  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
    
}

function setShaderModelViewMatrix(modelViewMatrix) {
    
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    
}

function setShaderNormalMatrix(normalMatrix) {
    
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
    
}

function getNormalMatrix(modelViewMatrix) {
    
  return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
    
}

function getProjectionMatrix() {

  return mat4.perspective(mat4.create(), fovy, 1.0, 0.1, 1000.0);
    
}

function getCameraMatrix() {
  return mat4.lookAt(mat4.create(), 
    eye, 
    center, 
    up);
}

function setShaderMaterial(material) {
    
  gl.uniform3fv(program.ka,    material.mat_ambient);
  gl.uniform3fv(program.kd,    material.mat_diffuse);
  gl.uniform3fv(program.ks,    material.mat_specular);
  gl.uniform1f (program.alpha, material.alpha);
    
}

function setShaderLight() {
    
  //gl.uniform3f(program.light1.position, 0.2, 0.2, 0.0);  // Position of first light
  gl.uniform3f(program.light1.la, 1.0,0.6,0.0);     // Ambient color
  gl.uniform3f(program.light1.ld, 1.0,0.6,0.0);     // Diffuse color
  gl.uniform3f(program.light1.ls, 1.0,0.6,0.0);     // Specular color
  
  // Set valuesprogram. for second light
  //gl.uniform3f(program.light2.position, 0.2, 0.2, 0.0);  // Position of second light
  gl.uniform3f(program.light2.la, 0.8,0.0,0.0);     // Ambient color
  gl.uniform3f(program.light2.ld, 0.8,0.0,0.0);     // Diffuse color
  gl.uniform3f(program.light2.ls, 0.8,0.0,0.0);
  // Set valuesprogram. for third light
  //gl.uniform3f(program.light3.position, 0.2, 0, 0.2);  // Position of third light
  gl.uniform3f(program.light3.la, 0.0,0.8,0.0);     // Ambient color
  gl.uniform3f(program.light3.ld, 0.0,0.8,0.0);     // Diffuse color
  gl.uniform3f(program.light3.ls, 0.0,0.8,0.0);
}

function prepareObject(Translation, Scaling, axis=" ", angle1=0, angle2=0)
{
  var modelMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  const rotationMatrix1 = mat4.create();
  const rotationMatrix2 = mat4.create();
  if (axis[0] === 'x') mat4.rotateX(rotationMatrix1, rotationMatrix1, angle1);
  else if (axis[0] === 'y') mat4.rotateY(rotationMatrix1, rotationMatrix1, angle1);
  else if (axis[0] === 'z') mat4.rotateZ(rotationMatrix1, rotationMatrix1, angle1);

  if (axis[1] === 'x') mat4.rotateX(rotationMatrix1, rotationMatrix1, angle2);
  else if (axis[1] === 'y') mat4.rotateY(rotationMatrix1, rotationMatrix1, angle2);
  else if (axis[1] === 'z') mat4.rotateZ(rotationMatrix1, rotationMatrix1, angle2);

  mat4.fromScaling(modelMatrix, Scaling)
  mat4.multiply(modelViewMatrix, modelMatrix, modelViewMatrix)
  mat4.multiply(modelViewMatrix, rotationMatrix1, modelViewMatrix)
  mat4.multiply(modelViewMatrix, rotationMatrix2, modelViewMatrix)
  mat4.fromTranslation(modelMatrix, Translation)
  mat4.multiply(modelViewMatrix, modelMatrix, modelViewMatrix)
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix)
  setShaderModelViewMatrix(modelViewMatrix);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

}


function drawSolid(model) {
    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute,  3, gl.FLOAT, false, 8*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,    3, gl.FLOAT, false, 8*4, 3*4);
  gl.vertexAttribPointer (program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 8*4, 6*4);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    
}

function moveEye () {
  
  return mat4.lookAt(mat4.create(), eye,  center, [0, 1, 0]);
}

function setTransformLight(uniformLocation, lightPos) {
  Lp = vec4.create();
  //mat4.multiply(Lp, getCameraMatrix(),lightPos);
  mat4.multiply(Lp, moveEye(),lightPos);
  gl.uniform3f(uniformLocation, Lp[0], Lp[1], Lp[2]);
}


function drawScene() {

  // se inicializan los buffers de color y de profundidad
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  gl.useProgram(program);
  // se obtiene la matriz de transformacion de la proyeccion y se envia al shader
  setShaderProjectionMatrix( getProjectionMatrix() );

  // se calcula la matriz de transformación del modelo
  var modelMatrix = mat4.create();  
  mat4.fromScaling (modelMatrix, [1, 1, 1]);
  
  // se opera la matriz de transformacion de la camara con la del modelo y se envia al shader
  var modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
  setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

  setTransformLight(program.light1.position, lightPos1);
  setTransformLight(program.light2.position,lightPos2);
  setTransformLight(program.light3.position,lightPos3);

    
  // se envia al Shader el material del objeto
  // En este ejemplo es el mismo material para los dos objetos
  setShaderMaterial(White_plastic);
    
  // se selecciona una unidad de textura
  gl.activeTexture(gl.TEXTURE3);

  // se asigna un objeto textura a la unidad de textura activa
  
  //drawSolid(exampleCube);
  
  gl.bindTexture(gl.TEXTURE_2D, texturesId[5]);
  prepareObject([0,-10,10],[10,10,10])
  drawSolid(table);
  gl.bindTexture(gl.TEXTURE_2D, texturesId[2]);
  prepareObject([0, 30,10],[1,1,1])
  drawSolid(plane)
  prepareObject([0,-10,0],[2,2,2], "x", -Math.PI/2)
  gl.bindTexture(gl.TEXTURE_2D, texturesId[1]);
  drawSolid(gingerbread)
  prepareObject([15,-10,50],[1,1,1], "yy", Math.PI/2)
  gl.bindTexture(gl.TEXTURE_2D, texturesId[3]);
  drawSolid(oven)
  prepareObject([0,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  gl.bindTexture(gl.TEXTURE_2D, texturesId[4]);
  drawSolid(man)
  prepareObject([-2,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  drawSolid(man)
  prepareObject([2,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  drawSolid(man)
  gl.bindTexture(gl.TEXTURE_2D, texturesId[1]);
  prepareObject([0,-2.5,9.5],[.25,0.25,0.25],"xx", Math.PI/2)
  drawSolid(hat)
  prepareObject([-40,-10,10],[0.3,0.3,0.3])
  gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
  drawSolid(tree)
  prepareObject([-10,10,20],[40,90,70], "zz", -Math.PI/2)
  drawSolid(exampleCube);
  gl.bindTexture(gl.TEXTURE_2D, texturesId[6]);
  prepareObject([12.1, 3.0, 49.5, 1.],[10,10,10], "zz", -Math.PI/2)
  drawSolid(exampleCube);
}

var v,u,n;
v = vec3.create();
u = vec3.create();
n = vec3.create();

function dolly(dn)
{
  vec3.subtract(n, eye, center)
  vec3.normalize(n, n)
  vec3.scale(n, n, dn)

  vec3.add(eye, eye, n)
  vec3.add(center, center, n)
}

function truck(du)
{
  vec3.subtract(n, eye, center);
  vec3.normalize(n, n);

  vec3.cross(u, up, n);
  vec3.normalize(u, u)
  vec3.scale(u,u,du)

  vec3.add(eye,eye, u)
  vec3.add(center, center, u)
}

function pedestal(dv)
{
  vec3.subtract(n, eye, center);
  vec3.normalize(n, n);

  vec3.cross(u, up, n);
  vec3.normalize(u, u)

  vec3.cross(v, n, u);
  vec3.normalize(v, v);
  vec3.scale(v, v, dv);

  vec3.add(eye, eye, v)
  vec3.add(center, center, v)

}

var new_center = vec3.create()
var tilt_rotate = mat4.create()
function tilt(angle)
{
  vec3.subtract(n, eye, center)
  vec3.normalize(n, n);

  vec3.cross(u, up, n);
  vec3.normalize(u, u)

  vec3.subtract(new_center, center, eye)

  mat4.fromRotation(tilt_rotate, angle, u)

  vec3.transformMat4(new_center, new_center, tilt_rotate)

  vec3.add(center, new_center, eye)
  vec3.cross(up, n, u);

  vec3.transformMat4(up, up, tilt_rotate)
}

function pan(angle)
{
  vec3.subtract(new_center, center, eye)

  mat4.fromRotation(tilt_rotate, angle, up)

  vec3.transformMat4(new_center, new_center, tilt_rotate)

  vec3.add(center, new_center, eye)
}

function initHandlers() {
    
  window.addEventListener('keydown', (event) => 
    {
      switch(event.key)
      {
        case 'w':
          dolly(-1)
          break;
        case 's':
          dolly(1);
          break; 
        case 'a':
          truck(-1);
          break;
        case 'd':
          truck(1);
          break;
         case 'ArrowUp':
          event.preventDefault()
          pedestal(1);
          break;
        case 'ArrowDown':
          event.preventDefault()
          pedestal(-1);
          break;
        case '4':
          pan(0.1)
          break;
        case '6':
          pan(-0.1)
          break;
        case '8':
          tilt(0.1);
          break;
        case '2':
          tilt(-0.1);
          break;
        case 'z':
          console.log(eye);
          break;
        default:
          console.log(event.key);
      }

      drawScene();
    })
    
 var colors = document.getElementsByTagName("input");

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("change",
    function(){
      switch (this.getAttribute("name")) {
        case "La": setColor(program.LaIndex, colors[0].value); break;
        case "Ld": setColor(program.LdIndex, colors[1].value); break;
        case "Ls": setColor(program.LsIndex, colors[2].value); break;
      }
      requestAnimationFrame(drawScene);
    },
    false);
  }
//     
  var textureFilename = document.getElementsByName("TextureFilename");
  
  for (var i = 0; i < textureFilename.length; i++) {
    textureFilename[i].addEventListener("change",
                                        changeTextureHandler(i),
                                        false);
  }
  
  function changeTextureHandler(texturePos) {
    return function(){
      if (this.files[0]!= undefined) {
        texturesId[texturePos].loaded = false;
        loadTextureFromFile(this.files[0], texturePos);
      }
    };
  }
    
  var range = document.getElementsByName("Repetition");
  
  range[0].addEventListener("mousemove",
                            function(){
                              gl.uniform1f(program.repetition, range[0].value);
                              requestAnimationFrame(drawScene);                              
                            },
                            false);

}

function setColor (index, value) {

  var myColor = value.substr(1); // para eliminar el # del #FCA34D
      
  var r = myColor.charAt(0) + '' + myColor.charAt(1);
  var g = myColor.charAt(2) + '' + myColor.charAt(3);
  var b = myColor.charAt(4) + '' + myColor.charAt(5);

  r = parseInt(r, 16) / 255.0;
  g = parseInt(g, 16) / 255.0;
  b = parseInt(b, 16) / 255.0;
  
  gl.uniform3f(index, r, g, b);
  
}

function allTexturesLoaded () {

  for (var i = 0; i < texturesId.length; i++)
    if (! texturesId[i].loaded)
      return false;
  
  return true;
  
}

function setTexture (image, texturePos) {

  // se indica el objeto textura
  gl.bindTexture(gl.TEXTURE_2D, texturesId[texturePos]);

  // Descomentar si es necesario voltear la textura
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    
  // datos de la textura
  gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    
  // parámetros de filtrado
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
  // parámetros de repetición (ccordenadas de textura mayores a uno)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    
  // creación del mipmap
  gl.generateMipmap(gl.TEXTURE_2D);

  texturesId[texturePos].loaded = true; // textura ya disponible

  if (allTexturesLoaded()) {
    
    initHandlers();
    requestAnimationFrame(drawScene);
    
  }

}

function loadTextureFromServer (filename, texturePos) {
    
  var image = new Image();
    
  image.addEventListener("load",
                         function() {
                           setTexture(image, texturePos);
                        },
                         false);
  image.addEventListener("error",
                         function(err) {
                           console.log("MALA SUERTE: no esta disponible " + this.src);
                        },
                         false);
  image.crossOrigin = 'anonymous'; // Esto evita que Chrome se queje de SecurityError al cargar la imagen de otro dominio
  image.src         = filename;

}

function initTextures() {

  var serverUrl    = "https://raw.githubusercontent.com/YusufHisil/WebGl-christmas-scene/refs/heads/master/models/";
  var texFilenames = ["tree.png", "gingerbread.jpg", "plane.jpg", "oven.png", "cookieTex.jpg", "woodTex.jpg", "whitePlastic.jpg"];

  for (var texturePos = 0; texturePos < texFilenames.length; texturePos++) {
  
    // creo el objeto textura
    texturesId[texturePos] = gl.createTexture();
    texturesId[texturePos].loaded = false;
    
    // solicito la carga de la textura
    loadTextureFromServer(serverUrl+texFilenames[texturePos], texturePos);
    
  }

}

function initWebGL() {
    
  gl = getWebGLContext();
    
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
      
  initShaders(); 
  initPrimitives(); 
  gl.useProgram(program);
  initRendering();
  initTextures();

}

initWebGL();
