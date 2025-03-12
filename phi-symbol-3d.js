// 3D Phi Symbol Animation
document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById('phi-symbol-container');
    const fallbackContainer = document.getElementById('phi-symbol-fallback');
    if (!container) return;

    // Check for WebGL support
    const isWebGLSupported = () => {
        try {
            const canvas = document.createElement('canvas');
            return !!window.WebGLRenderingContext && 
                  (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch(e) {
            return false;
        }
    };
    
    // Check if device is low-powered (simple mobile detection)
    const isLowPoweredDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
               window.innerWidth < 768;
    };
    
    // Device doesn't support WebGL or is a low-powered mobile device
    if (!isWebGLSupported() || isLowPoweredDevice()) {
        if (container) container.style.display = 'none';
        if (fallbackContainer) fallbackContainer.style.display = 'flex';
        return; // Exit early to avoid WebGL initialization
    } else {
        if (fallbackContainer) fallbackContainer.style.display = 'none';
    }

    // Create canvas and get WebGL context
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    container.appendChild(canvas);
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Vertex shader
    const vertexShaderSource = `
        attribute vec4 a_position;
        attribute vec4 a_color;
        attribute vec3 a_normal;
        uniform mat4 u_worldViewProjection;
        uniform mat4 u_worldInverseTranspose;
        uniform vec3 u_lightWorldPosition;
        uniform vec3 u_viewWorldPosition;
        varying vec4 v_color;
        varying vec3 v_normal;
        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;
        void main() {
            gl_Position = u_worldViewProjection * a_position;
            v_normal = mat3(u_worldInverseTranspose) * a_normal;
            vec3 surfaceWorldPosition = (u_worldViewProjection * a_position).xyz;
            v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
            v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
            v_color = a_color;
        }
    `;

    // Fragment shader
    const fragmentShaderSource = `
        precision mediump float;
        varying vec4 v_color;
        varying vec3 v_normal;
        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;
        uniform float u_shininess;
        void main() {
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
            vec3 surfaceToViewDirection = normalize(v_surfaceToView);
            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
            float light = dot(normal, surfaceToLightDirection);
            float specular = 0.0;
            if (light > 0.0) {
                specular = pow(dot(normal, halfVector), u_shininess);
            }
            gl_FragColor = v_color;
            gl_FragColor.rgb *= light;
            gl_FragColor.rgb += specular;
        }
    `;

    // Create shader program
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    // Look up attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
    
    const worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    const lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
    const viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
    const shininessLocation = gl.getUniformLocation(program, "u_shininess");

    // Create phi symbol vertices
    // This creates a basic 3D phi symbol using primitives
    function createPhiSymbol(size) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];
        
        // Define primary color for the phi symbol
        const primaryColor = [0.3, 0.5, 1, 1]; // Light blue
        
        // Create the vertical line of phi
        const stemWidth = size * 0.15;
        const stemHeight = size * 2;
        const stemDepth = size * 0.15;
        
        // Create a box for the vertical stem
        createBox(
            -stemWidth/2, -stemHeight/2, -stemDepth/2,
            stemWidth, stemHeight, stemDepth,
            positions, normals, colors, indices, primaryColor
        );
        
        // Create the circular part of phi
        const circleRadius = size * 0.6;
        const circleThickness = size * 0.15;
        const segments = 32;
        
        createTorus(
            0, stemHeight/4, 0,
            circleRadius, circleThickness,
            segments, 12,
            positions, normals, colors, indices, primaryColor
        );
        
        return {
            positions: positions,
            colors: colors,
            normals: normals,
            indices: indices
        };
    }

    // Helper to create a box
    function createBox(x, y, z, width, height, depth, positions, normals, colors, indices, color) {
        const startIndex = positions.length / 3;
        
        // Create vertices for a box
        const x2 = x + width;
        const y2 = y + height;
        const z2 = z + depth;
        
        // Add vertex positions
        // Front face
        positions.push(x, y, z2);
        positions.push(x2, y, z2);
        positions.push(x2, y2, z2);
        positions.push(x, y2, z2);
        
        // Back face
        positions.push(x, y, z);
        positions.push(x, y2, z);
        positions.push(x2, y2, z);
        positions.push(x2, y, z);
        
        // Top face
        positions.push(x, y2, z);
        positions.push(x, y2, z2);
        positions.push(x2, y2, z2);
        positions.push(x2, y2, z);
        
        // Bottom face
        positions.push(x, y, z);
        positions.push(x2, y, z);
        positions.push(x2, y, z2);
        positions.push(x, y, z2);
        
        // Right face
        positions.push(x2, y, z);
        positions.push(x2, y2, z);
        positions.push(x2, y2, z2);
        positions.push(x2, y, z2);
        
        // Left face
        positions.push(x, y, z);
        positions.push(x, y, z2);
        positions.push(x, y2, z2);
        positions.push(x, y2, z);
        
        // Add normals
        // Front face - all normals point in +z direction
        for (let i = 0; i < 4; i++) {
            normals.push(0, 0, 1);
        }
        
        // Back face - all normals point in -z direction
        for (let i = 0; i < 4; i++) {
            normals.push(0, 0, -1);
        }
        
        // Top face - all normals point in +y direction
        for (let i = 0; i < 4; i++) {
            normals.push(0, 1, 0);
        }
        
        // Bottom face - all normals point in -y direction
        for (let i = 0; i < 4; i++) {
            normals.push(0, -1, 0);
        }
        
        // Right face - all normals point in +x direction
        for (let i = 0; i < 4; i++) {
            normals.push(1, 0, 0);
        }
        
        // Left face - all normals point in -x direction
        for (let i = 0; i < 4; i++) {
            normals.push(-1, 0, 0);
        }
        
        // Add colors (same color for all vertices)
        for (let i = 0; i < 24; i++) {
            colors.push(...color);
        }
        
        // Add indices for the 6 faces (2 triangles per face)
        for (let i = 0; i < 6; i++) {
            const v = startIndex + i * 4;
            indices.push(v, v + 1, v + 2);
            indices.push(v, v + 2, v + 3);
        }
    }
    
    // Helper to create a torus (circular ring)
    function createTorus(cx, cy, cz, radius, thickness, radialSegments, tubularSegments, positions, normals, colors, indices, color) {
        const startIndex = positions.length / 3;
        
        // Create a torus - a circle swept around another circle
        for (let i = 0; i <= radialSegments; i++) {
            const theta = i * Math.PI * 2 / radialSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let j = 0; j <= tubularSegments; j++) {
                const phi = j * Math.PI * 2 / tubularSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                // Calculate position
                const x = (radius + thickness * cosPhi) * cosTheta + cx;
                const y = (radius + thickness * cosPhi) * sinTheta + cy;
                const z = thickness * sinPhi + cz;
                
                positions.push(x, y, z);
                
                // Calculate normal
                const nx = cosTheta * cosPhi;
                const ny = sinTheta * cosPhi;
                const nz = sinPhi;
                normals.push(nx, ny, nz);
                
                // Add color
                colors.push(...color);
                
                // Add indices for triangles
                if (i < radialSegments && j < tubularSegments) {
                    const a = startIndex + i * (tubularSegments + 1) + j;
                    const b = startIndex + i * (tubularSegments + 1) + j + 1;
                    const c = startIndex + (i + 1) * (tubularSegments + 1) + j;
                    const d = startIndex + (i + 1) * (tubularSegments + 1) + j + 1;
                    
                    indices.push(a, b, d);
                    indices.push(a, d, c);
                }
            }
        }
    }

    // Create phi symbol geometry
    const phiSymbol = createPhiSymbol(0.5);

    // Create and bind buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(phiSymbol.positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(phiSymbol.colors), gl.STATIC_DRAW);
    
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(phiSymbol.normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(phiSymbol.indices), gl.STATIC_DRAW);

    // Matrix math functions
    function m4identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    
    function m4multiply(a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
        const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
        const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }

    function m4perspective(fieldOfViewInRadians, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }

    function m4translation(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    }

    function m4xRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    }

    function m4yRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    }

    function m4zRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    
    function m4scaling(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    }
    
    function m4inverse(m) {
        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];
        
        const tmp_0 = m22 * m33;
        const tmp_1 = m32 * m23;
        const tmp_2 = m12 * m33;
        const tmp_3 = m32 * m13;
        const tmp_4 = m12 * m23;
        const tmp_5 = m22 * m13;
        const tmp_6 = m02 * m33;
        const tmp_7 = m32 * m03;
        const tmp_8 = m02 * m23;
        const tmp_9 = m22 * m03;
        const tmp_10 = m02 * m13;
        const tmp_11 = m12 * m03;
        const tmp_12 = m20 * m31;
        const tmp_13 = m30 * m21;
        const tmp_14 = m10 * m31;
        const tmp_15 = m30 * m11;
        const tmp_16 = m10 * m21;
        const tmp_17 = m20 * m11;
        const tmp_18 = m00 * m31;
        const tmp_19 = m30 * m01;
        const tmp_20 = m00 * m21;
        const tmp_21 = m20 * m01;
        const tmp_22 = m00 * m11;
        const tmp_23 = m10 * m01;

        const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    }
    
    function m4transpose(m) {
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15],
        ];
    }

    // Animation variables
    let rotation = 0;
    
    // Draw scene
    function drawScene() {
        // Clear canvas
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // Use our program
        gl.useProgram(program);

        // Set up position attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // Set up color attribute
        gl.enableVertexAttribArray(colorAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
        
        // Set up normal attribute
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // Set up index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // Create matrices for the scene
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projectionMatrix = m4perspective(Math.PI / 3, aspect, 0.1, 100);
        
        // Position camera
        const cameraPosition = [0, 0, 2.5];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        
        // Compute view matrix (not shown for brevity)
        const viewMatrix = m4translation(0, 0, -2.5);

        // Update rotation
        rotation += 0.01;
        
        // Set model matrix with Y-axis rotation only
        const modelYRotation = m4yRotation(rotation);
        let modelMatrix = modelYRotation; // Entferne X-Rotation
        
        // Combine matrices to create world view projection
        const viewProjectionMatrix = m4multiply(projectionMatrix, viewMatrix);
        const worldViewProjectionMatrix = m4multiply(viewProjectionMatrix, modelMatrix);
        
        // Calculate the inverse transpose of the world matrix for correct normal transformations
        const worldInverseMatrix = m4inverse(modelMatrix);
        const worldInverseTransposeMatrix = m4transpose(worldInverseMatrix);

        // Set uniforms
        gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
        gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
        
        // Set lighting position
        gl.uniform3fv(lightWorldPositionLocation, [2, 5, 3]);
        gl.uniform3fv(viewWorldPositionLocation, cameraPosition);
        gl.uniform1f(shininessLocation, 150);

        // Draw
        gl.drawElements(gl.TRIANGLES, phiSymbol.indices.length, gl.UNSIGNED_SHORT, 0);

        // Request next frame
        requestAnimationFrame(drawScene);
    }

    // Start animation
    drawScene();
});
