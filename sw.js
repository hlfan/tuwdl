const v="v2";
self.addEventListener("install",e=>{
	e.waitUntil(caches.open(v).then(c=>
		c.addAll(["index.html","app.js","app.css","manifest.json"]
			.map(r=>new Request(r,{cache:"reload",mode:"same-origin"})))
	))
}),
self.addEventListener("fetch",e=>{
	let d=async e=>{
		let ch=await caches.match(e.request)||0;
		let r=e.request;
		if((new URL(e.request.url)).origin===location.origin)
			r=new Request(e.request,{headers:{
			...Object.fromEntries(e.request.headers.entries()),
			'if-none-match':ch?.headers?.get('etag')||"0"
		}});
		let f=fetch(r);
		u(e,f);
		return ch||f
	},
	u=async(e,f)=>{
		let r=await f;
		if(![0,200].includes(r.status))return;
		if(r.type==='opaqueredirect')return;
		let k=r.clone(),
			c=await caches.open(v);
		c.put(e.request,k);
	};
	e.respondWith(d(e))
}),
self.addEventListener("activate",e=>{
	e.waitUntil(caches.keys().then(c=>
		Promise.all(c.map(n=>[v].includes(n)||caches.delete(n)))
	))
});
