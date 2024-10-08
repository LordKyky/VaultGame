import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import { Application, Assets, Sprite } from 'pixi.js';

import { gsap } from "gsap";   
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

var size = [1920, 1080];
var ratio = size[0] / size[1];

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

(async () =>
  {
    // Create a new application
    const app = new Application();
  
    // Initialize the application
    await app.init({ background: '#fcba03', resizeTo: window }).then(() =>
      {
        app.canvas.style.position = 'absolute';
  
        // Append the application canvas to the document body
        document.body.appendChild(app.canvas);
  
        // Add the assets to load
        Assets.add({ alias: 'bg', src: 'assets/bg.png' });
        Assets.add({ alias: 'door', src: 'assets/door.png' });
    
        // Start loading right away and create a promise
        //const texturePromise = Assets.load('https://pixijs.com/assets/bunny.png');
  
        // Load the assets and get a resolved promise once both are loaded
        const texturesPromise = Assets.load(['bg', 'door']); // => Promise<{flowerTop: Texture, eggHead: Texture}>
  
    
        // When the promise resolves, we have the texture!
        texturesPromise.then((textures) =>
        {
          // // create a new Sprite from the resolved loaded Texture
          // const bunny = Sprite.from(resolvedTexture);
          
          // // center the sprite's anchor point
          // bunny.anchor.set(0.5);
          
          // // move the sprite to the center of the screen
          // bunny.x = app.screen.width / 2;
          // bunny.y = app.screen.height / 2;
          
          // app.stage.addChild(bunny);
          
          const bg = Sprite.from(textures.bg);
          bg.anchor.set(0.5);
          bg.x = app.screen.width / 2;
          bg.y = app.screen.height / 2;
          bg.width = app.screen.width;
          bg.height = app.screen.height;
          app.stage.addChild(bg);
        });
      });
  })();