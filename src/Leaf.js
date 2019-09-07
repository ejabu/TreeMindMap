import React, { Component } from 'react';
import './Leaf.css';
import ImgViewer from './ImgViewer'
import Menu from './Menu'
import { DragSource, DropTarget } from 'react-dnd'
import MarkdownTextBox from '@3yaa3yaa/markdowntextbox';
import StateProvider from './StateProvider'

class Leaf extends Component {

    constructor(props) {
        super(props);
        this.leafTextAreaRef=React.createRef()
        this.leafRef=React.createRef()
        this.state={focused:true, hover:false}
        //this.leafTextAreaRef.onfocus=()=>{this.setState({focused:true})}
        //this.leafTextAreaRef.onblur=()=>{this.setState({focused:false})}
    }

    componentDidMount()
    {
        //this.leafTextAreaRef.focus()
    }

    keyDownHandler(e) {
        switch (e.keyCode) {
            case 13: //Enter
                if (e.shiftKey != true) {
                    e.preventDefault();
                    this.props.addSibling(this.props.leafdata.id);
                }
                break;
            case 9: //Tab
                if (e.shiftKey!=true)
                {
                    e.preventDefault()
                    this.props.addChild(this.props.leafdata.id)
                }
                else
                {
                    e.preventDefault()
                    this.props.walk(StateProvider.whereToMove().LEVELUP);
                }
                break;
            case 46: //Delete
                    e.preventDefault()
                    this.props.delete(this.props.leafdata.id)
                    break;
            case 38: //UP
                e.preventDefault()
                this.props.walk(StateProvider.whereToMove().UP);
                break;
            case 40: //Down
                e.preventDefault()
                this.props.walk(StateProvider.whereToMove().DOWN);
                break;
            // case 37 : //LEFT
            //     e.preventDefault()
            //     this.props.walk(StateProvider.whereToMove().LEVELUP);
            //     break;
            // case 39: //RIGHT
            //     e.preventDefault()
            //     this.props.walk(StateProvider.whereToMove().LEVELDOWN);
            //     break;
        }
    }

    onChangeHandler(e)
    {
        let newleaf = this.props.leafdata
        newleaf.title=e.target.value
        this.props.edit(newleaf)
    }

    onFocusHandler(e)
    {
        //this.props.jump(this.props.leafdata.id);
    }

    onBlurHandler(e)
    {

        //this.setState({focused:false})
        //this.leafRef.style
        //this.leafRef.style={backgroundColor: "#FF0000"};
    }

    _getLeafInputFieldsStyle()
    {
        if(this.state.focused)
        {
            return {opacity:"1"}
        }
        else
        {
            return {opacity: "0"}
        }
    }

    _getTextAreaStyle()
    {
        let leafsize=this._getLeafSize()

        return {
            textAlign: "left",
            backgroundColor: "transparent",
            border: "none",
            width: leafsize.width,
            height: leafsize.height,
            margin: "1px",
            padding: "0px",
            minWidth: "50px",
            verticalAlign: "middle",
            color: "white",
            webkitUserSelect : "auto",
            //webkitOverflowScrolling: "touch"
        }
    }

    _getLeafStyle()
    {
        let color=this.props.leafdata.color;
        if(color==undefined){color="silver"};

        return {
            textAlign: "left",
            backgroundColor: color,
            padding: "10px",
            marginTop: "1px",
            marginBottom: "1px",
            marginLeft:"0px",
            marginRight:"0px",
            borderRadius:"10px",
            resize: "both"
            }
    }

    _getLeafFirstColumnStyle()
    {
        // let leafsize=this._getLeafSize()
        //
        // let out={
        //     width: leafsize.width,
        //     height: leafsize.height
        // }
        // return out
    }

    _getLeafSize() {
        let widthtobeset = "50px"
        if (typeof (this.props.leafdata.title) == "string") {
            let lines = this.props.leafdata.title.split('\n')
            let reducer = (acc, curr) => {
                if (acc < curr) {
                    return curr
                } else {
                    return acc
                }
            };
            let maxwidth = lines.map((line) => line.length).reduce(reducer, 5)
            widthtobeset = (Math.floor(maxwidth / 5) * 75)
            if (widthtobeset > 200) {
                widthtobeset = 200
            }
            widthtobeset = widthtobeset + "px"
        }
        let out= {
            width: widthtobeset
        }
        return out;
    }

    _getBurgerVisibility()
    {
        if(this.state.hover)
        {
            return {visibility: "visible" }
        }
        else
        {
            return {visibility: "hidden"}
        }
    }

    _getIsFocused()
    {
        if(this.props.leafdata.id==this.props.focusId)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    _getDOM(){
    return (
        <div className="Leaf"
             onFocus={(e)=>this.onFocusHandler(e)}
             onBlur={(e)=>this.onBlurHandler(e)}
             onKeyDown={(e)=>this.keyDownHandler(e)}
             onMouseOver={(e)=>this.setState({hover:true})}
             onMouseLeave={(e)=>this.setState({hover:false})}
             onClick={(e)=>{this.props.jump(this.props.leafdata.id)}}
             style={this._getLeafStyle()}
             ref={(e)=>{this.leafRef=e}} >
            <div className="Leaf-Row">
                <div className="Leaf-Columns" style={this._getLeafFirstColumnStyle()}>
                    <div className="Leaf-Row">
                        <div className="Leaf-Colomuns">
                            <MarkdownTextBox value={this.props.leafdata.title}
                                             onChange={(e)=>this.onChangeHandler(e)}
                                             focus={this._getIsFocused()}
                                              />
                        </div>
                    </div>
                    <div className="Leaf-Row"><ImgViewer leafdata={this.props.leafdata}/></div>
                </div>
                <div className="Leaf-Colomuns">
                    <Menu leafdata={this.props.leafdata}
                          edit={this.props.edit}
                          addChild={this.props.addChild}
                          addSibling={this.props.addSibling}
                          style={this._getBurgerVisibility()}/>
                </div>
            </div>
        </div>

    )
    }

    render() {
        //const { isDragging,dragSource, text, connectDropTarget, isOver, children } = this.props;
        const { connectDragSource, connectDropTarget } = this.props;
        return (
             connectDropTarget(connectDragSource(
                 this._getDOM()
             ))
        );
    }
}

const dragSpec = {
    beginDrag: (props) => { return props.leafdata },
    endDrag: (props,monitor,component)=>{
        let dragged=monitor.getItem()
        let dropped=monitor.getDropResult()
        if(dropped!=null)
        {
            if(dragged.id!=dropped.id)
            {
                dragged.parentid=dropped.id
                component.props.edit(dragged)
            }
        }
    }
}

const dropSpec = {
    drop: (props, monitor, component)=> {
        return props.leafdata;
    }
}


function collectDrag(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    }
}



Leaf=DropTarget("leaf", dropSpec, collectDrop)(Leaf)
Leaf=DragSource("leaf", dragSpec, collectDrag)(Leaf)

export default Leaf ;
