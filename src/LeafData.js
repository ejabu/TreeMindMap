export default class LeafData{
    constructor(id=0, description="", children=[], imgs=[],color="silver")
    {
        this.id=id;
        this.description=description;
        this.children=children;
        this.imgs=imgs;
        this.color=color;
    }

    static getNewObject(rawdata)
    {
        try{
            return new LeafData(rawdata.id, rawdata.description, rawdata.children, rawdata.imgs, rawdata.color)
        }catch(e)
        {
            console.error("failed to generate new leaf object :" + e.message)
        }
    }

    isLeafDataClass()
    {
        return true;
    }
    
    getLeaf(id)
    {
        if(this.id===id)
        {
            return this;
        }
        else
        {
            for(let leaf of this.children)
            {
                let child=leaf.getLeaf(id)
                if(child!=null)
                {
                    return child;
                }
            }
        }
        return null;
    }

    isNullObject()
    {
        if(this.children.length===0 && this.description==="" && this.imgs.length===0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    getParent(id)
    {
        if(this.children.find(l => l.id===id) != undefined)
        {
            return this;
        }
        else
        {
            for(let l of this.children)
            {
                let parent=l.getParent(id);
                if(parent!=null)
                {
                    return parent;
                }
            }
        }
        return null;
    }


    getSiblings(id)
    {
        return this.getParent(id).children;
    }

    getElderBrother(id)
    {
        let brothers=this.getSiblings(id);
        let elderbrother=null;
        for(let brother of brothers)
        {
            if(brother.id===id){return elderbrother};
            elderbrother=brother;
        }
        return null;
    }

    isLastRecord(id)
    {
        if(this.getYoungerBrother(id)===null)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    getYoungerBrother(id)
    {
        let brothers=this.getSiblings(id);
        let wasMe=false;
        for(let brother of brothers)
        {
            if(wasMe){return brother};
            if(brother.id===id){wasMe=true};
        }
        return null;
    }



    getChildren( id)
    {
        let l = this.getLeaf(id);
        if(l===null)
        {
            return [];
        }
        else
        {
            return l.children;
        }
    }

    getAllFamilyMembers()
    {
        let out=[this];
        out=out.concat(this.getAllChildren());
        return out;
    }


    getAllChildren()
    {
        let out=[];
        this._setChildrenInArray(this.id, out)
        return out;
    }


    _setChildrenInArray(id, out)
    {
        let current = this.getLeaf(id);
        if(id!=this.id)
        {
            out.push(current);
        }
        current.children.forEach((child)=>{this._setChildrenInArray(child.id, out)});
    }

    filterAndSortLeafs(leafs, parentid)
    {
        let out=[];
        if(Array.isArray(leafs) && leafs.length>0)
        {
            let bigbrother = leafs.filter((leaf)=>{return (leaf.parentid==parentid && leaf.elderbrotherid==0)})[0];
            StateProvider.recursivelyGetSiblings(leafs, bigbrother, out);
            return out;
        }
        else
        {
            return null;
        }
    }

    getNewId()
    {
        return this.getLatestId()+1;
    }

    getLatestId()
    {
        let children=this.getAllChildren()
        if(children.length>0)
        {
            return children.sort((a,b)=>{return b.id-a.id})[0].id;
        }
        else
        {
            return 0;
        }
    }

    labelExists(label)
    {
        let regexp= new RegExp('#' + label+ '(:|\r\n|\n|\r| |$)','g');
        if(regexp.test(this.description))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    codeExists()
    {
        let regexp=/```([\n\r]|.)*```/;
        if(regexp.test(this.description))
        {
            return true;
        }
        else
        {
            return false;
        }
    }


    getLabelValues(label)
    {
        let regexp;
        if(label==="")
        {
            regexp= new RegExp('#([^ ]+?)(\r\n|\n|\r| |$)','g')
        }
        else
        {
            regexp= new RegExp('#' + label+ ':([^ ]+?)(\r\n|\n|\r| |$)','g')
        };
        return [...this.description.matchAll(regexp)].map(el=>{return el[1]});
    }

    getLabelFieldsOfChildren()
    {
        let items=[this];
        items=items.concat(this.getAllChildren());
        let array=[];
        if(items===null){return array};
        for(let item of items)
        {
            let regexp = new RegExp('#([^ ]+?)(\r\n|\n|\r| |$)','g');
            array=array.concat([...item.description.matchAll(regexp)].map(el=>{return el[1]}));
        }
        array=array.map(el=>{return el.replace(/:.*/,'')}); //Remove Value
        array=array.filter(el=>!isFinite(el))   //Remove Numbers
        array=array.filter((x, i, self) => self.indexOf(x) === i); //Remove Duplicates
        return array;
    }

    getNumericValuesOfChildren(label="")
    {
        return this.getChildrenValues(label).filter(el=>isFinite(el));
    }

    getChildrenValues(label="")
    {
        let items=[this];
        items=items.concat(this.getAllChildren());
        let array=[];
        if(items===null){return array};
        for(let item of items)
        {
            array=array.concat(item.getLabelValues(label));
        }
        return array;
    }



    sumLabelsOfChildren(label)
    {
        let array=this.getNumericValuesOfChildren(label);
        let reducer=(acc, cur)=>{
            return acc+parseFloat(cur);
        };
        return array.reduce(reducer,0);
    }

     countLabelsOfChildren(label)
    {
        let array=this.getNumericValuesOfChildren(label);
        return array.length;
    }

    meanLabelsOfChildren(label)
    {
        return Math.round((this.sumLabelsOfChildren(label)/this.countLabelsOfChildren(label)) * 10) / 10 // 出力：123.5
    }

}