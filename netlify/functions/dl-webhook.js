exports.handler = async function(event, context) {
	let things2get = [{v:'GSHEETS_JSON',m:'text'},{v:'DISCORD_WEBHOOK_URL',m:'json'}],
		[data, message] = await Promise.all(things2get.map(t=>fetch(process.env['TUWDL_'+t.v]).then(a=>a[t.m]()))),
		toLocalDate=c=>{
			d=eval('new '+(c?.v||'Date(0)'));
			return new Date(2*d-new Date(d.toLocaleString("en",{timeZone:"Europe/Vienna"})))},
		list="";
	for (let row of JSON.parse(data.match(/\(({.+})\)/)[1]).table.rows) {
		time = toLocalDate(row.c[0]);
		line = ` <t:${ time / 1e3 }:R>`;
		time -= Date.now();
		if (time < 0) continue;
		time = (time < 6048e5) ? line : "";
		line = '\n' + row.c[13]?.v.replace(/{d}/g, row.c[0].f.replace(/\. /g, ' '));
		dorn = toLocalDate(row.c[1]) < new Date;
		line = line.replace(/\((\w)\b/g, `(${process.env.URL}/$1`);
		if(dorn) line = line.replace(/__/g, '___');
		if (row.c[5]?.v != 'TRUE') line = line.replace(/__/g, '');
		blist = list + line + time;
		if (blist.length < 2e3) list = blist;
	}
	if(list.includes('#NAME'))return{statusCode:503};
	let content=list.replace(/@/g, '@ ').replace(/  /g, ' ').trim();
	if(message.content===content){console.log('no change necessary');return{statusCode:204}};
	line=({body:JSON.stringify({content}),method:"PATCH"});
	line.headers=({"content-type":"application/json"});
	console.log(await(await fetch(process.env.TUWDL_DISCORD_WEBHOOK_URL,line)).json());
    return{statusCode:204}
}
