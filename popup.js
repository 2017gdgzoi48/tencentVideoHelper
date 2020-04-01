function init(){
	var url=chrome.runtime.getURL('tencent.js');
	chrome.tabs.query({
	    url:'https://v.qq.com/x/page/*'
	},function(tab){
		if(tab.length==0){
			document.getElementsByTagName('body')[0].innerText='没找到腾讯视频页面!';
			return ;
		}
		tab=tab[0];
		chrome.tabs.executeScript(tab.id, {
		    code:'var tag=document.createElement("script");tag.src=chrome.runtime.getURL("tencent.js");document.body.append(tag);'
		})
	})
}
setTimeout(init,50);