function m3u8(link,name='下载',mixTs=true){
	this.wantMix=mixTs;
	this.DONE=4;
	this.MIXING=3;
	this.FAILED=2;
	this.RECIEVING=1;
	this.INITED=0;
	this.status=0;
	this.linksArr=[];
	this.tsArr=[];
	this.domain='';
	this.mixTs=function(){
		var blo=new Blob(this.tsArr);
		var tag=document.createElement('a');
		tag.href=URL.createObjectURL(blo);
		tag.download=name+'.ts';
		tag.click();
	}
	this.getData=async function(linksArr){
		this.status=3;
		var mix='',len=0;
		for(var i=0;i<this.linksArr.length;i++){
			if(linksArr[i].startsWith('http')==false)linksArr[i]=this.domain+linksArr[i];
			if(document.URL.startsWith('https')&&(!linksArr[i].startsWith('https')))
				linksArr[i]=linksArr[i].replace('http','https');
			var res=await fetch(linksArr[i]);
			var ab=await res.arrayBuffer();
			this.tsArr[i]=ab;
			if(!this.wantMix){
				var blo=new Blob(ab);
				var tag=document.createElement('a');
				tag.href=URL.createObjectURL(blo);
				tag.download=name+len+'.ts';
				len++;
				tag.click();
			}
		}
		if(this.wantMix)this.mixTs();
		this.status=4;
	}
	this.walk=function(id,list){
		if(id==list.length){
			if(this.wantMix)this.getData(this.linksArr);
			return ;
		}
		if(list[id].indexOf('.ts')==-1){
			if(list[id].startsWith('http')==false)list[id]=this.domain+list[id]
			var walker=new m3u8(list[id],false);
			walker.run();
			this.linksArr=this.linksArr.concat(walker.linksArr);
		}
		else this.linksArr.push(list[id]);
		this.walk(id+1,list);
	}
	this.init=function(link){
		if(document.URL.startsWith('https')&&(!link.startsWith('https')))
			link=link.replace('http','https');
		this.domain=link.slice(0,link.lastIndexOf('/')+1);
		var xhr=new XMLHttpRequest();
		xhr.open('GET',link,false);
		xhr.send();
		if(xhr.status!=200){
			this.status=2;
		}
		var str=xhr.response;
		if(str.indexOf('#EXTINF')==-1){
			var arr=str.split(/#EXT-X-STREAM-INF/);
			arr.shift();
			var info='',links=[];
			for(var i=0;i<arr.length;i++){
			    var data=arr[i].slice(1).split('\n')[0].split(',');
			    var idx=[data.findIndex(ele=>{return ele.split('=')[0]=='BANDWIDTH'}),data.findIndex(ele=>{return ele.split('=')[0]=='RESOLUTION'}),data.findIndex(ele=>{return ele.split('=')[0]=='CODECS'})];
			    var brand=data[idx[0]].split('=')[1],size='未设置',codecs='未设置';
			    if(idx[1]!=-1)size=data[idx[1]].split('=')[1];
			    if(idx[2]!=-1)codecs=data[idx[2]].split('=')[1];
			    info+='第'+(i+1)+'个的信息: 分辨率:'+size+' 带宽:'+brand+' 解码格式:'+codecs+'\n';
			    links.push(arr[i].slice(1).split('\n')[1]);
			}
			info+="选择第几个呢?(1-"+arr.length+")";
			var choose=prompt(info);
			while(choose<1||choose>arr.length){alert("请重新选择");choose=prompt(info);}
			this.list=[links[choose-1]];
			return;
		}
		var arr=str.split(/\s*#EXT.+\s+/g);
		arr=arr.filter(ele=>{return ele!=''});
		if(this.domain=='')this.domain=link.slice(0,link.lastIndexOf('/')+1);
		this.list=arr;
	}
	this.init(link);
	this.run=function(){
		this.linksArr=[];
		this.tsArr=[];
		this.status=1;
		this.walk(0,this.list);
		return this.status; 
	}
}
var title=document.title;
title=title.slice(0,title.indexOf('_腾'));
PLAYER.seekTo(0);
function walk(time){
	if(time+60*3-1>=PLAYER.getDuration()){
		setTimeout(async ()=>{
			var video=[];
			urls.filter(ele=>{
				try{
					ele.slice(38).split('&')[36].split('=')[1].replace(/%3A/g,':').replace(/%2F/g,'/').replace(/%3D/g,'=').replace(/%3F/g,'?').replace(/%26/g,'&');
				}catch(err){
					return 0;
				}
				return ele.slice(38).split('&')[36].split('=')[1].replace(/%3A/g,':').replace(/%2F/g,'/').replace(/%3D/g,'=').replace(/%3F/g,'?').replace(/%26/g,'&')!='';
			}).filter(ele=>{
				var link=ele.slice(38).split('&')[36].split('=')[1].replace(/%3A/g,':').replace(/%2F/g,'/').replace(/%3D/g,'=').replace(/%3F/g,'?').replace(/%26/g,'&');
				return link.indexOf('.mp4')+1||link.indexOf('.m3u8')+1;
			}).forEach(ele=>{
				video.push(ele.slice(38).split('&')[36].split('=')[1].replace(/%3A/g,':').replace(/%2F/g,'/').replace(/%3D/g,'=').replace(/%3F/g,'?').replace(/%26/g,'&'))
			});
			video=new Set(video.sort());
			var tmp=[];
			video.forEach(ele=>tmp.push(ele));
			video=tmp;
			delete tmp;
			console.log(video);
			if(video.some(ele=>ele.indexOf('.m3u8')!=-1)){
				video=video[0];
				var help=new m3u8(video,title);
				help.run();
				return;
			}
			for(var i=0;i<video.length;i++){
				blo=await fetch(video[i]);
				if(!blo.ok)return;
				blo=await blo.arrayBuffer();		
				var tag=document.createElement('a');
				tag.href=URL.createObjectURL(new Blob([blo]));
				tag.download=title+(i+1)+'.mp4';
				tag.click();
			}
		},50000);
		return;
	}
	PLAYER.seekRight(60*3-1);
	setTimeout(walk,1000,time+60*3-1);
}
setTimeout(walk,1000,0)