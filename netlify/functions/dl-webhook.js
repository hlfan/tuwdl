import fetch from "node-fetch";

exports.handler = async function(event, context) {
    console.log("Received event:", event);
	r=process.env.TUWDL_DISCORD_WEBHOOK_URL;
	line=({body:JSON.stringify({content:`Test: ${new Date()}`}),method:"PATCH"});
	line.headers=({"content-type":"application/json"});
	console.log(await(await fetch(r,line)).json());
    return{statusCode:204}
}
