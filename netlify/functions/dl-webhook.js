exports.handler = async function(event, context) {
	let things2get = [{v:'GSHEETS_JSON',m:'text'},{v:'DISCORD_WEBHOOK_URL',m:'json'}],
		[data, message] = await Promise.all(things2get.map(t=>fetch(process.env['TUWDL_'+t.v]).then(a=>a[t.m]()))),
		list="";
	for (let row of JSON.parse(data.match(/\(({.+})\)/)[1]).table.rows) {
		time = row.c[0]?.v ? eval("new " + row.c[0]?.v) : new Date(0);
		line = new Date(time.toLocaleString('en-US',{timeZone:'Europe/Vienna'}));
		line = `+0${(line.getTime()-time.getTime())/36e5}:00`;
		time = new Date(time.toISOString().slice(0,-1)+line);
		time = time.getTime();
		line = ` <t:${ time / 1e3 }:R>`;
		time -= Date.now();
		if (time < 0) continue;
		time = (time < 6048e5) ? line : "";
		line = '\n' + row.c[13]?.v.replace(/{d}/g, row.c[0].f.replace(/\. /g, ' '));
		from = row.c[1]?.v && eval("new " + row.c[1]?.v) > new Date;
		line = line.replace(/\((\w)\b/g, `(${process.env.URL}/$1`);
		if(!from) line = line.replace(/__/g, '___');
		if (row.c[5]?.v != 'TRUE') line = line.replace(/__/g, '');
		trow = list + line + time;
		if (trow.length < 2e3) list = trow;
	}
	if(list.includes('#NAME'))return{statusCode:503};
	let content=list.replace(/@/g, '@ ').replace(/  /g, ' ').trim();
	if(message.content===content){console.log('no change necessary');return{statusCode:204}};
	line=({body:JSON.stringify({content}),method:"PATCH"});
	line.headers=({"content-type":"application/json"});
	console.log(await(await fetch(process.env.TUWDL_DISCORD_WEBHOOK_URL,line)).json());
    return{statusCode:204}
}
