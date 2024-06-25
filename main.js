import "./style.css";
import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

class Site {
    constructor({ dom }) {
        this.time = 0;
        this.container = dom;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.images = [...document.querySelectorAll(".images img")];
        this.material;
        this.imageStore = [];
        this.uStartIndex = 0;
        this.uEndIndex = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            100,
            2000
        );
        this.camera.position.z = 200;
        this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 * Math.PI);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);

        this.addImages();
        this.resize();
        this.setupResize();
        this.setPositions();
        this.render();
    }
    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.setPositions();
    }
    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }
    setPositions() {
        this.imageStore.forEach((img) => {
            const bounds = img.img.getBoundingClientRect();
            img.mesh.position.y = -bounds.top + this.height / 2 - bounds.height / 2;
            img.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
        });
    }
    addImages() {
        const textureLoader = new THREE.TextureLoader();
        const textures = this.images.map((img) => textureLoader.load(img.src));

        // console.log(textures);
        const uniforms = {
            uTime: { value: 0 },
            uImage: { value: textures[0] },
        };

        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
        });

        this.images.forEach((img) => {
            const bounds = img.getBoundingClientRect();
            const geometry = new THREE.PlaneGeometry(
                bounds.width,
                bounds.height
            );
            const mesh = new THREE.Mesh(geometry, this.material);
            this.scene.add(mesh);
            this.imageStore.push({
                img: img,
                mesh: mesh,
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
            });
        });
    }


    render() {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Site({
    dom: document.querySelector(".canvas"),
});
