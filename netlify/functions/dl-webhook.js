exports.handler = async function(event, context) {
	let list = "", row, cells, time, line;
	let r=process.env.TUWDL_GSHEETS_JSON;
	r=await(await fetch(r)).text();
	for (row of JSON.parse(r.split('setResponse')[1].slice(1, -2)).table.rows) {
		cells = row.c;
		time = cells[0]?.v ? eval("new " + cells[0]?.v) : new Date(0);
		line = new Date(time.toLocaleString('en-US',{timeZone:'Europe/Vienna'}));
		line = `+0${(line.getTime()-time.getTime())/36e5}:00`;
		time = new Date(time.toISOString().slice(0,-1)+line);
		time = time.getTime();
		line = ` <t:${ time / 1e3 }:R>`;
		time -= Date.now();
		if (time < 0) continue;
		time = (time < 6048e5) ? line : "";
		line = '\n' + cells[13]?.v.replace(/{d}/g, cells[0].f.replace(/\. /g, ' '));
		row = cells[1]?.v && eval("new " + cells[1]?.v) > new Date;
		line = line.replace(/\((\w)\b/g, '(https://tuwdl.netlify.app/$1');
		if(!row) line = line.replace(/__/g, '___');
		if (cells[5]?.v != 'TRUE') line = line.replace(/__/g, '');
		row = list + line + time;
		if (row.length < 2e3) list = row;
	}
	if(list.includes('#NAME'))return;
	r=process.env.TUWDL_DISCORD_WEBHOOK_URL;
	list=({content:list.replace(/@/g, '@ ').replace(/  /g, ' ').trim()});
	line=({body:JSON.stringify(list),method:"PATCH"});
	line.headers=({"content-type":"application/json"});
	console.log("Received event body:", event.body);
	console.log("for site: " + process.env.URL);
	console.log(await(await fetch(r,line)).json());
    return{statusCode:204}
}
