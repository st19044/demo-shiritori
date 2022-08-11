import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts"

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

let a = getRandomInt(0, 30);

let previousWord;

if ( 0<= a && a > 10 ) {
    previousWord = "しりとり";
} else if ( 10<= a && a > 20 ) {
    previousWord = "りんご";
} else  {
    previousWord = "ごりら";
}

let rireki = new Array();

function ishiragana(str) {
    str = (str == null)?"": str;
    if(str.match(/^[ぁ-んー ]*$/)){
        return true;
    }else{
        return false;
    }
}

console.log("Listening on https://localhost:8000");
serve(async req => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);

    if (req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }
    if (req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord;
        if (
            nextWord.length > 0 && 
            previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)
        ) {
            return new Response("前の単語に続いていません。", { status: 400 });
        }
        if ( nextWord.length > 0 && nextWord.charAt(nextWord.length - 1 ) == "ん" ){
            return new Response("ゲームを終了します。", {status: 400 });
        }
        
        if (rireki.indexOf(nextWord) == 1) {
            return new Response("一度使った単語です。", { status: 400 });
        }

        if ( rireki[0] !== nextWord) {
            rireki.unshift(nextWord);
        }

        if (ishiragana(nextWord) == false) {
            return new Response("ひらがな以外が含まれています。", { status: 400 });
        }

        previousWord = nextWord;
        return new Response(previousWord);
    }

    return serveDir(req, {
        fsRoot: "public",
        urlRoot: "", 
        showDirListing: true, 
        enableCors: true, 
    });
});