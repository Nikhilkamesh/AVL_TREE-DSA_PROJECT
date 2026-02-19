/* ================= AVL NODE ================= */

class AVLNode{
    constructor(value){
        this.value=value;
        this.left=null;
        this.right=null;
        this.height=1;

        // visualization
        this.x=0;
        this.y=0;
        this.id="node-"+Math.random().toString(36).slice(2,9);
    }
}

/* ================= AVL TREE ================= */

class AVLTree{
    constructor(){
        this.root=null;
    }

    height(node){
        return node?node.height:0;
    }

    balanceFactor(node){
        return node?this.height(node.left)-this.height(node.right):0;
    }

    updateHeight(node){
        node.height=1+Math.max(this.height(node.left),this.height(node.right));
    }

    /* ---------- ROTATIONS ---------- */

    async rightRotate(y){
        let x=y.left;
        let t2=x.right;

        await highlightNode(y.id,"#f59e0b");
        await highlightNode(x.id,"#f59e0b");

        x.right=y;
        y.left=t2;

        this.updateHeight(y);
        this.updateHeight(x);

        drawTree();
        await sleep(500);

        return x;
    }

    async leftRotate(x){
        let y=x.right;
        let t2=y.left;

        await highlightNode(x.id,"#f59e0b");
        await highlightNode(y.id,"#f59e0b");

        y.left=x;
        x.right=t2;

        this.updateHeight(x);
        this.updateHeight(y);

        drawTree();
        await sleep(500);

        return y;
    }

    /* ---------- INSERT ---------- */

    async insert(node,value){
        if(!node) return new AVLNode(value);

        if(value<node.value)
            node.left=await this.insert(node.left,value);

        else if(value>node.value)
            node.right=await this.insert(node.right,value);

        else{
            showMessage("Duplicate values not allowed","error");
            return node;
        }

        this.updateHeight(node);

        let bf=this.balanceFactor(node);

        // LL
        if(bf>1 && value<node.left.value)
            return await this.rightRotate(node);

        // RR
        if(bf<-1 && value>node.right.value)
            return await this.leftRotate(node);

        // LR
        if(bf>1 && value>node.left.value){
            node.left=await this.leftRotate(node.left);
            return await this.rightRotate(node);
        }

        // RL
        if(bf<-1 && value<node.right.value){
            node.right=await this.rightRotate(node.right);
            return await this.leftRotate(node);
        }

        return node;
    }

    /* ---------- MIN NODE ---------- */

    minValue(node){
        while(node.left) node=node.left;
        return node;
    }

    /* ---------- DELETE ---------- */

    async delete(node,value){
        if(!node) return null;

        if(value<node.value)
            node.left=await this.delete(node.left,value);

        else if(value>node.value)
            node.right=await this.delete(node.right,value);

        else{
            if(!node.left||!node.right){
                node=node.left||node.right;
            }
            else{
                let temp=this.minValue(node.right);
                node.value=temp.value;
                node.right=await this.delete(node.right,temp.value);
            }
        }

        if(!node) return node;

        this.updateHeight(node);
        let bf=this.balanceFactor(node);

        if(bf>1 && this.balanceFactor(node.left)>=0)
            return await this.rightRotate(node);

        if(bf>1 && this.balanceFactor(node.left)<0){
            node.left=await this.leftRotate(node.left);
            return await this.rightRotate(node);
        }

        if(bf<-1 && this.balanceFactor(node.right)<=0)
            return await this.leftRotate(node);

        if(bf<-1 && this.balanceFactor(node.right)>0){
            node.right=await this.rightRotate(node.right);
            return await this.leftRotate(node);
        }

        return node;
    }

    /* ---------- SEARCH ---------- */

    async search(node,value){
        if(!node) return null;

        await highlightNode(node.id,"#3b82f6");
        await sleep(250);

        if(node.value===value) return node;

        if(value<node.value)
            return await this.search(node.left,value);
        else
            return await this.search(node.right,value);
    }

    /* ---------- TRAVERSALS ---------- */

    inorder(node,res=[]){
        if(node){
            this.inorder(node.left,res);
            res.push(node.value);
            this.inorder(node.right,res);
        }
        return res;
    }

    preorder(node,res=[]){
        if(node){
            res.push(node.value);
            this.preorder(node.left,res);
            this.preorder(node.right,res);
        }
        return res;
    }

    postorder(node,res=[]){
        if(node){
            this.postorder(node.left,res);
            this.postorder(node.right,res);
            res.push(node.value);
        }
        return res;
    }

    count(node){
        if(!node) return 0;
        return 1+this.count(node.left)+this.count(node.right);
    }
}

/* ================= VISUALIZATION ================= */

const tree=new AVLTree();
const svg=document.getElementById("treeSvg");
const levelGap=75;

function sleep(ms){
    return new Promise(r=>setTimeout(r,ms));
}

/* ---------- MESSAGES ---------- */

function showMessage(msg,type="info"){
    const box=document.getElementById("messageBox");

    let color="#38bdf8";
    if(type==="error") color="#ef4444";
    if(type==="success") color="#22c55e";
    if(type==="warning") color="#f59e0b";

    box.textContent=msg;
    box.style.borderColor=color;
    box.style.color=color;

    box.style.opacity="1";
    box.style.transform="translateY(0)";

    setTimeout(()=>{
        box.style.opacity="0";
        box.style.transform="translateY(-20px)";
    },2600);
}


/* ---------- STATS ---------- */

function updateStats(){
    document.getElementById("treeHeight").textContent=tree.height(tree.root);
    document.getElementById("nodeCount").textContent=tree.count(tree.root);
}

/* ---------- DRAW TREE ---------- */

function drawTree(){

    svg.innerHTML=`
    <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
    <feMerge>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
    </feMerge>
    </filter>

    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#6366f1"/>
    <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    </defs>`;

    if(!tree.root) return;

    /* IMPORTANT PART — fixed coordinate system */
    const SVG_WIDTH = 1400;
    const SVG_HEIGHT = 700;

    const centerX = SVG_WIDTH/2;
    const startY = 80;
    const horizontalGap = 260;

    setPosition(tree.root,centerX,startY,horizontalGap);

    render(tree.root);
}


function setPosition(node,x,y,gap){
    if(!node) return;

    node.x=x;
    node.y=y;

    const nextGap = Math.max(gap/2, 40);

    setPosition(node.left,x-gap,y+90,nextGap);
    setPosition(node.right,x+gap,y+90,nextGap);
}


function render(node){
    if(!node) return;

    if(node.left) createLink(node,node.left);
    if(node.right) createLink(node,node.right);

    createNode(node);

    render(node.left);
    render(node.right);
}

function createLink(p,c){
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",p.x);
    line.setAttribute("y1",p.y);
    line.setAttribute("x2",c.x);
    line.setAttribute("y2",c.y);
    line.setAttribute("class","link");
    svg.appendChild(line);
}

function createNode(node){
    const g=document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("transform",`translate(${node.x},${node.y})`);
    g.setAttribute("id",node.id);

    const circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("r",20);
    circle.setAttribute("class","node-circle");

    const text=document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttribute("dy","5");
    text.setAttribute("class","node-text");
    text.textContent=node.value;

    const bf=document.createElementNS("http://www.w3.org/2000/svg","text");
    bf.setAttribute("dy","32");
    bf.setAttribute("class","node-bf");
    bf.textContent="BF:"+tree.balanceFactor(node);

    g.appendChild(circle);
    g.appendChild(text);
    g.appendChild(bf);

    svg.appendChild(g);

    g.animate([
        {transform:`translate(${node.x},${node.y}) scale(0)`},
        {transform:`translate(${node.x},${node.y}) scale(1.2)`},
        {transform:`translate(${node.x},${node.y}) scale(1)`}
    ],{duration:400});
}

/* ---------- HIGHLIGHT ---------- */

async function highlightNode(id,color){
    const g=document.getElementById(id);
    if(!g) return;
    const c=g.querySelector("circle");

    c.style.stroke=color;
    c.style.strokeWidth="5";
    c.style.filter=`drop-shadow(0 0 10px ${color})`;

    await sleep(400);

    c.style.stroke="rgba(255,255,255,0.2)";
    c.style.strokeWidth="2";
    c.style.filter="url(#glow)";
}

/* ================= CONTROLS ================= */

function getValue(){
    const input=document.getElementById("nodeValue");
    const v=parseInt(input.value);
    if(isNaN(v)){showMessage("Enter a valid number","error");return null;}
    input.value="";
    return v;
}

let busy=false;

async function insertNode(){
    if(busy) return;
    const v=getValue();
    if(v===null) return;

    busy=true;
    showMessage("Inserting "+v);
    tree.root=await tree.insert(tree.root,v);
    drawTree(); updateStats();
    showMessage("Inserted "+v,"success");
    busy=false;
}

async function deleteNode(){
    if(busy) return;
    const v=getValue();
    if(v===null) return;

    busy=true;
    const found=await tree.search(tree.root,v);
    if(!found){showMessage("Not Found","error");busy=false;return;}

    tree.root=await tree.delete(tree.root,v);
    drawTree(); updateStats();
    showMessage("Deleted "+v,"warning");
    busy=false;
}

async function searchNode(){
    if(busy) return;
    const v=getValue();
    if(v===null) return;

    busy=true;
    const res=await tree.search(tree.root,v);
    if(res) showMessage("Found "+v,"success");
    else showMessage("Not Found","error");
    busy=false;
}

function clearTree(){
    tree.root=null;
    drawTree();
    updateStats();
}

/* traversal */

function traversal(type){
    let res=[];
    if(type==="inorder") res=tree.inorder(tree.root);
    if(type==="preorder") res=tree.preorder(tree.root);
    if(type==="postorder") res=tree.postorder(tree.root);
    document.getElementById("traversalOutput").textContent=res.join(" → ");
}

/* random */

async function generateRandom(){
    const v=Math.floor(Math.random()*100)+1;
    tree.root=await tree.insert(tree.root,v);
    drawTree(); updateStats();
}

/* events */

document.getElementById("btnInsert").onclick=insertNode;
document.getElementById("btnDelete").onclick=deleteNode;
document.getElementById("btnSearch").onclick=searchNode;
document.getElementById("btnClear").onclick=clearTree;
document.getElementById("btnRandom").onclick=generateRandom;

document.getElementById("nodeValue").addEventListener("keypress",e=>{
    if(e.key==="Enter") insertNode();
});

window.addEventListener("resize",drawTree);

drawTree();
