/*
* Atari Arcade SDK
* Developed by gskinner.com in partnership with Atari
* Visit http://atari.com/arcade/developers for documentation, updates and examples.
*
* Copyright (c) Atari Interactive, Inc. All Rights Reserved. Atari and the Atari logo are trademarks owned by Atari Interactive, Inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

(function(scope){

    var TexturePackerUtils = function(){
        throw(new Error("TexturePackerUtils can not be instanciated."));
    };

    TexturePackerUtils.createSpriteSheet = function(json, baseUrl, frequency){
        baseUrl = baseUrl || "";
        frequency = frequency || 1;
        var easelData = {images: [baseUrl + json.meta.image]};
        easelData.frames = [];
        easelData.animations = {};
        var frames = json.frames;
        var frameNum = 0;
        for(var id in frames){
            var shortId = id.split(".")[0];
            //Extract frame Data
            var frame = frames[id].frame;
            easelData.frames.push([frame.x, frame.y, frame.w, frame.h]);

            //Add frame to animations list
            if(!easelData.animations[shortId]){
                //By default, all animations will repeat.
                // TODO: We need more finegrained control over looping... not sure the best way to do this.
                easelData.animations[shortId] = {frames: [], next: shortId, frequency: frequency};
            }
            easelData.animations[shortId].frames.push(frameNum);
            frameNum++;
        }
        return new GameLibs.SpriteSheetWrapper(easelData);
    }
    scope.TexturePackerUtils = TexturePackerUtils;

}(window.GameLibs))