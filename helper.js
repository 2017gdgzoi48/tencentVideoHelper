var ele=document.createElement('script');
ele.innerHTML=`
var urls=[];
function checkURL(url){
    urls.push(url);
    return false;
}//true->block false->pass
function makeFake(res){}
function changeAjax(){
    if(typeof tmp0!=='undefined')return;
    tmp0=XMLHttpRequest.prototype.open;
    function tmpOpen(method, url, async='true', user=null, password=null){
        tmp0.call(this,method, url, async, user, password);
        this.async=async;
    }
    XMLHttpRequest.prototype.open=tmpOpen;
    tmp1=XMLHttpRequest.prototype.send;
    function tmpSend (data) {
        tmp1.call(this,data);
        if(this.async==false&&checkURL(this.responseURL)){
            var blob=new Blob([makeFake(this.response)]);
            var fakeURL=URL.createObjectURL(blob);
            var tmp3=this.onreadystatechange;
            this.onreadystatechange=null;
            tmp0.call(this,'GET',fakeURL,false);
            tmp1.call(this);
            this.onreadystatechange=tmp3;
            if(typeof tmp2!=='undefined')tmp2();
        }
        if(this.onreadystatechange!=null&&this.onreadystatechange.isSet===undefined)
            tmp2=this.onreadystatechange;
        function tmpChange(data){
            if(this.readyState==4&&checkURL(this.responseURL)){
                clearInterval(this.handle);
                var fakeResponse='';
                var blob=new Blob([makeFake(this.response)]);
                var fakeURL=URL.createObjectURL(blob);
                var tmp3=this.onreadystatechange;
                this.onreadystatechange=null;
                tmp0.call(this,'GET',fakeURL,false);
                tmp1.call(this);
                this.onreadystatechange=tmp3;
                if(typeof tmp2!=='undefined')tmp2();
                return;
            }
            if(typeof tmp2!=='undefined')tmp2();
        }
        tmpChange.isSet=1;
        this.onreadystatechange=tmpChange;
        this.handle=setInterval(()=>{
            if(this.onreadystatechange.isSet==undefined){
                tmp2=this.onreadystatechange;
                function tmpChange(data){
                    if(this.readyState==4&&checkURL(this.responseURL)){
                        var fakeResponse='';
                        var blob=new Blob([makeFake(this.response)]);
                        var fakeURL=URL.createObjectURL(blob);
                        var tmp3=this.onreadystatechange;
                        this.onreadystatechange=null;
                        tmp0.call(this,'GET',fakeURL,false);
                        tmp1.call(this);
                        this.onreadystatechange=tmp3;
                        tmp2();
                        clearInterval(this.handle);
                        return;
                    }
                    tmp2();
                }
                tmpChange.isSet=1;
                this.onreadystatechange=tmpChange;
            }
        },1);   
    }
    XMLHttpRequest.prototype.send=tmpSend;
    tmp4=fetch;
    async function tmpFetch(url,init){
        var res=await tmp4(url,init);
        if(!checkURL(url))return res;
        var text=await res.text();
        text=makeFake(text);
        var fakeRes={
            type: res.type,
            url: res.url,
            redirected: res.redirected,
            status: res.status,
            ok: res.ok,
            statusText: res.statusText,
            headers: res.headers,
            turnData:text,
            text: async function(){return this.turnData},
            blob: async function(){return new Blob([this.turnData])},
            arrayBuffer: async function(){return await new Response(new Blob([this.turnData])).arrayBuffer()},
            json: async function(){return JSON.parse(this.turnData)}
        }
        return fakeRes;
    }
    fetch=tmpFetch;
}
changeAjax();`
var hanlde=setInterval(function(){
	if(document.body){
		document.body.appendChild(ele);
		clearInterval(hanlde);
	}
},1)