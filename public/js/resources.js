const JSON_PATH = 'assets/json/';
const IMAGE_PATH = 'assets/images/';
const JSON_EXT = ['json'];
const IMAGE_EXT = ['gif', 'png', 'svg', 'jpg', 'jpeg'];


export class ResourceManager {
    constructor(loader) {
        this.resources = [];
        this.loader = loader;
    }

    getResource(name) {
        let [ext] = name.split(".").slice(-1);
        let url, fileType;

        if (JSON_EXT.includes(ext.toLowerCase())) {
            url = `${JSON_PATH}${name}`;
            fileType = "json";
        }
        if (IMAGE_EXT.includes(ext.toLowerCase())) {
            url = `${IMAGE_PATH}${name}`;
            fileType = "image";
        }

        return {name, url, fileType};
    }

    addResource(fileName) {
        if (!this.resources.map(r => r.name).includes(fileName)) {
            let resource = this.getResource(fileName);
    
            this.loader.add(fileName, resource.url);
            this.resources.push(resource);
        }
    }

    loadAll() {
        const resourceMap = new Map();

        const getObject = (resources, resource) => {
            if (resource.fileType === "image") {
                return resources[resource.name].texture;
            }

            if (resource.fileType === "json") {
                return resources[resource.name].data;
            }
        }

        const promise = new Promise(resolve => {
            this.loader.load((loader, resources) => {
                this.resources.forEach(resource => {
                    resourceMap.set(
                        resource.name, 
                        getObject(resources, resource)
                    );
                });

                resolve(resourceMap);
            });
        });

        return promise;
    }
}


// export class ResourceLoader {

//     constructor() {
//         this.resources = [];
//     }

//     getResource(name) {
//         let [ext] = name.split(".").slice(-1);
//         let url, fileType;

//         if (JSON_EXT.includes(ext.toLowerCase())) {
//             url = `${JSON_PATH}${name}`;
//             fileType = "json";
//         }
//         if (IMAGE_EXT.includes(ext.toLowerCase())) {
//             url = `${IMAGE_PATH}${name}`;
//             fileType = "image";
//         }

//         return {name, url, fileType};
//     }

//     addResource(name, fileName) {
//         this.resources.push(this.getResource(name, fileName));
//     }

//     async loadJson(name, url) {
//         const response = await fetch(url);
//         const json = await response.json();
//         return { name, resource: json };
//     }

//     async loadImage(name, url) {
//         const buffer = document.createElement('canvas');
//         const context = buffer.getContext('2d');
    
//         await new Promise(resolve => {
//             const image = new Image();

//             image.addEventListener('load', () => {
//                 buffer.width = image.width;
//                 buffer.height = image.height;
//                 context.drawImage(image, 0, 0);
//                 resolve(buffer);

//             });

//             image.src = url;
//         });
//         return { name, resource: new ImageResource(buffer) };
//     }

//     async loadAll() {
//         const resourceMap = new Map();

//         const promises = [];

//         this.resources.forEach(({name, url, fileType}) => {
//             if (fileType === 'json') {
//                 promises.push(this.loadJson(name, url));
//             }

//             if (fileType === 'image') {
//                 promises.push(this.loadImage(name, url))
//             }
//         });

//         const results = await Promise.all(promises);
//         results.forEach(({name, resource}) => {
//             resourceMap.set(name, resource);
//         });
//         return resourceMap;
//     }
// }


// class ImageResource {
//     constructor(buffer) {
//         this._buffer = buffer;

//         this.caches = new Map();
//     }

//     get buffer() {
//         return this._buffer;
//     }

//     get width() {
//         return this._buffer.width;
//     }

//     get height() {
//         return this._buffer.height;
//     }

//     getTransformed(scaleX, scaleY, theta) {
//         let signature = "" + [scaleX, scaleY, theta];

//         if (this.caches.has(signature)) {
//             return this.caches.get(signature);
//         }

//         const newBuffer = document.createElement('canvas');
//         const newContext = newBuffer.getContext('2d');

//         newContext.imageSmoothingEnabled = true;

//         let [width, height] = [this.width, this.height];
//         let [x, y] = [0, 0];

//         newBuffer.width = width * Math.abs(scaleX);
//         newBuffer.height = height * Math.abs(scaleY);

//         if (scaleX !== 0 || scaleY !== 0) {
//             newContext.scale(scaleX, scaleY);
            
//             if (scaleX < 0) {
//                 x -= width;
//             }
            
//             if (scaleY < 0) {
//                 y -= height;
//             }
//         }
        
//         newContext.drawImage(this.buffer, x, y);
//         this.caches.set(signature, newBuffer);
//         return newBuffer;
//     }
// }
