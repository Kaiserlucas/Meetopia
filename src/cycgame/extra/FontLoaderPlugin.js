import WebFont from "webfontloader";

// https://github.com/miltoncandelero/pixi-webfont-loader/blob/master/src/WebfontLoaderPlugin.ts
class FontLoaderPlugin {
    static add() {
        // PIXI.LoaderResource.setExtensionLoadType('css', PIXI.LoaderResource.LOAD_TYPE.XHR);
        // PIXI.LoaderResource.setExtensionXhrType('css', PIXI.LoaderResource.XHR_RESPONSE_TYPE.TEXT);
    }

    static pre(resource, next) {
        if (resource.extension !== "css") {
            return next();
        }

        //prevent css from actual loading, because the browser will load the css natively
        resource.complete();
        return next();
    }

    static use(resource, next) {
        if (resource.extension !== "css") {
            return next();
        }

        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.type = 'text/css';
        newLink.href = resource.url;
        document.head.appendChild(newLink);

        // load fontface with WebFontLoader https://github.com/typekit/webfontloader
        WebFont.load({
            custom: {
                families: [
                    resource.name,
                ]
            },
            active: (e) => {
                //success
                return next();
            },
            inactive: (e) => {
                //unable to load, timeout after 2sec
                return next();
            },
            timeout: 2000,
        });
    }
}

export default FontLoaderPlugin;