const JSON_PATH = 'assets/json/';
const IMAGE_PATH = 'assets/images/';
const JSON_EXT = ['json'];
const IMAGE_EXT = ['gif', 'png', 'svg', 'jpg', 'jpeg'];

export class ResourceLoader {

    constructor() {
        this.resources = [];
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

    addResource(name, fileName) {
        this.resources.push(this.getResource(name, fileName));
    }

    async loadJson(name, url) {
        const response = await fetch(url);
        const json = await response.json();
        return { name, resource: json };
    }

    async loadImage(name, url) {
        const buffer = document.createElement('canvas');
        const context = buffer.getContext('2d');
    
        await new Promise(resolve => {
            const image = new Image();

            image.addEventListener('load', () => {
                buffer.width = image.width;
                buffer.height = image.height;
                context.drawImage(image, 0, 0);
                resolve(buffer);

            });

            image.src = url;
        });
        return { name, resource: buffer };
    }

    async loadAll() {
        const resourceMap = new Map();

        const promises = [];

        this.resources.forEach(({name, url, fileType}) => {
            if (fileType === 'json') {
                promises.push(this.loadJson(name, url));
            }

            if (fileType === 'image') {
                promises.push(this.loadImage(name, url))
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({name, resource}) => {
            resourceMap.set(name, resource);
        });
        return resourceMap;
    }
}

