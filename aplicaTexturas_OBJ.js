
var gl, program, program2;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 50, fovy = 1.4;
var selectedPrimitive = tree;

var texturesId = [];

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

  // material
  program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
  program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
  program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
  program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");
    
  // fuente de luz
  program.LaIndex               = gl.getUniformLocation( program, "Light.La");
  program.LdIndex               = gl.getUniformLocation( program, "Light.Ld");
  program.LsIndex               = gl.getUniformLocation( program, "Light.Ls");
  program.PositionIndex         = gl.getUniformLocation( program, "Light.Position");
  
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

    
  myTorus = makeTorus(0.4, 1.0, 8, 12);
  initBuffers(myTorus);
    
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

  return mat4.perspective(mat4.create(), fovy, 1.0, 0.1, 100.0);
    
}

function getCameraMatrix() {
    
  // coordenadas esféricas a rectangulares: https://en.wikipedia.org/wiki/Spherical_coordinate_system
  var x = radius * Math.sin(myPhi) * Math.sin(myZeta);
  var y = radius * Math.cos(myPhi);
  var z = radius * Math.sin(myPhi) * Math.cos(myZeta);

  return mat4.lookAt(mat4.create(), [x, y, z], [0, 0, 0], [0, 1, 0]);
    
}

function setShaderMaterial(material) {
    
  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
    
}

function setShaderLight() {
    
  gl.uniform3f(program.LaIndex,       1.0, 1.0, 1.0);
  gl.uniform3f(program.LdIndex,       1.0, 1.0, 1.0);
  gl.uniform3f(program.LsIndex,       1.0, 1.0, 1.0);
  gl.uniform3f(program.PositionIndex, 0.2, 0.2, 0.0); // en coordenadas del ojo
    
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


// function rotateObject(object, axis, angle) {
//     const rotationMatrix = mat4.create();
//     if (axis === 'x') mat4.rotateX(rotationMatrix, rotationMatrix, angle);
//     else if (axis === 'y') mat4.rotateY(rotationMatrix, rotationMatrix, angle);
//     else if (axis === 'z') mat4.rotateZ(rotationMatrix, rotationMatrix, angle);

    
//     const rotatedVertices = [];
//     for (let i = 0; i < object.vertices.length; i += 3) {
//         const vertex = vec3.fromValues(
//             object.vertices[i],
//             object.vertices[i + 1],
//             object.vertices[i + 2]
//         );
//         vec3.transformMat4(vertex, vertex, rotationMatrix);
//         rotatedVertices.push(...vertex);
//     }

//     return {
//         vertices: rotatedVertices,
//         indices: object.indices, 
//     };
// }

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
    
  // se envia al Shader el material del objeto
  // En este ejemplo es el mismo material para los dos objetos
  setShaderMaterial(White_plastic);
    
  // se selecciona una unidad de textura
  gl.activeTexture(gl.TEXTURE3);

  // se asigna un objeto textura a la unidad de textura activa
  
  gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
  //drawSolid(exampleCube);
  
  prepareObject([0,-10,10],[10,10,10])
  drawSolid(table);
  prepareObject([0, 30,10],[1,1,1])
  drawSolid(plane)
  prepareObject([0,-10,0],[2,2,2], "x", -Math.PI/2)
  drawSolid(gingerbread)
  prepareObject([15,-10,50],[1,1,1], "yy", Math.PI/2)
  drawSolid(oven)
  prepareObject([0,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  drawSolid(man)
  prepareObject([-2,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  drawSolid(man)
  prepareObject([2,-2.5,5],[0.21,0.21,0.21], "zx", Math.PI, Math.PI/2)
  drawSolid(man)
  prepareObject([0,-2.5,9.5],[.25,0.25,0.25],"xx", Math.PI/2)
  drawSolid(hat)
  prepareObject([-40,-10,10],[0.3,0.3,0.3])
  drawSolid(tree)
}

function initHandlers() {
    
  var mouseDown = false;
  var lastMouseX;
  var lastMouseY;

  var canvas = document.getElementById("myCanvas");

  canvas.addEventListener("mousedown",
    function(event) {
      mouseDown  = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    },
    false);

  canvas.addEventListener("mouseup",
    function() {
      mouseDown = false;
    },
    false);
  
  canvas.addEventListener("wheel",
    function (event) {
      
      var delta = 0.0;

      if (event.deltaMode == 0)
        delta = event.deltaY * 0.001;
      else if (event.deltaMode == 1)
        delta = event.deltaY * 0.03;
      else
        delta = event.deltaY;

      if (event.shiftKey == 1) { // fovy
          
        fovy *= Math.exp(-delta)
        fovy = Math.max (0.1, Math.min(3.0, fovy));
        
//         htmlFovy.innerHTML = (fovy * 180 / Math.PI).toFixed(1);
        
      } else {
        
        radius *= Math.exp(-delta);
        // radius  = Math.max(Math.min(radius, 30), 0.05);
        
//         htmlRadius.innerHTML = radius.toFixed(1);
        
      }
      
      event.preventDefault();
      requestAnimationFrame(drawScene);

    }, false);

  canvas.addEventListener("mousemove",
    function (event) {
      
      if (!mouseDown) {
        return;
      }
      
      var newX = event.clientX;
      var newY = event.clientY;
      
      myZeta -= (newX - lastMouseX) * 0.005;
      myPhi  -= (newY - lastMouseY) * 0.005;
        
      var margen = 0.01;
      myPhi = Math.min (Math.max(myPhi, margen), Math.PI - margen);
        
//       htmlPhi.innerHTML  = (myPhi  * 180 / Math.PI).toFixed(1);
//       htmlZeta.innerHTML = (myZeta * 180 / Math.PI).toFixed(1);
     
      lastMouseX = newX
      lastMouseY = newY;
      
      event.preventDefault();
      requestAnimationFrame(drawScene);
      
    },
    false);
    
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

function loadTextureFromFile(filename, texturePos) {

  var reader = new FileReader(); // Evita que Chrome se queje de SecurityError al cargar la imagen elegida por el usuario
  
  reader.addEventListener("load",
                          function() {
                            var image = new Image();
                            image.addEventListener("load",
                                                   function() {
                                                     setTexture(image, texturePos);
                                                  },
                                                   false);
                            image.src = reader.result;
                          },
                          false);
  
  reader.readAsDataURL(filename);

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

  var serverUrl    = "https://raw.githubusercontent.com/YusufHisil/flappy_bird_java/3aa32efea23c7175e19dbb814a605f4724abcf68/";
  var texFilenames = ["background.png"];

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
