import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import nodesData from "../src/data/nodesData.json"; 
import membersData from '../src/data/membersData.json'; 

const ThreeDGraph = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    // camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const aspectRatio = width / height;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 80, 160); // adjust camera distance from the center
    camera.lookAt(0, 0, 0); // ensure camera looks at the center
    // camera.position.set(0, 100, 200); // Moving the camera further back


    // renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // orbitcontrols
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth control
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    // axes helper (optional for debugging)
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // define materials
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000099 });
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    // create nodes(cubes)and members(lines)
    const nodeGeometry = new THREE.BoxGeometry(2, 2, 2); // Represent each node as a small cube
    nodesData.forEach((node) => {
      const cube = new THREE.Mesh(nodeGeometry, cubeMaterial);
      cube.position.set(
        parseFloat(node.X),
        parseFloat(node.Y),
        parseFloat(node.Z)
      );
      scene.add(cube);
    });

    // create member lines
    membersData.forEach((member) => {
      const startNode = nodesData.find((node) => node.Node === member["Start Node"]);
      const endNode = nodesData.find((node) => node.Node === member["End Node"]);

      if (startNode && endNode) {
        const points = [];
        points.push(new THREE.Vector3(parseFloat(startNode.X), parseFloat(startNode.Y), parseFloat(startNode.Z)));
        points.push(new THREE.Vector3(parseFloat(endNode.X), parseFloat(endNode.Y), parseFloat(endNode.Z)));

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    });

    // center the geometry based on the bounding box
    const boundingBox = new THREE.Box3().setFromObject(scene);
    const center = boundingBox.getCenter(new THREE.Vector3());
    scene.position.sub(center); // Move the entire scene to the center

    // animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // update controls
      renderer.render(scene, camera);
    };

    animate();

    // clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ThreeDGraph;