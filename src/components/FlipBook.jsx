import HtmlFlipBook from "react-pageflip";
import {useRef, useState} from "react";
import {useElementDimensions} from "../utils/react-util.jsx";
import {useExpandChildren, useComponentLibrary, useVar} from "katnip-components";
import {useFeather} from "use-feather";

const SHADOW_LG="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);";

export function FlipBook({children, logicPageWidth, pageAspectRatio, frontPage, backPage, spreadIndex, pageColor}) {
	if (!pageColor)
		pageColor="#fff";

	children=useExpandChildren(children);
	let spreadIndexVar=useVar(spreadIndex);
	let componentLibrary=useComponentLibrary();
	let FrontPage=componentLibrary[frontPage];
	let BackPage=componentLibrary[backPage];
	let containerRef=useRef();
	let innerRef=useRef();
	let bookRef=useRef();
	let dimensions=useElementDimensions(containerRef);
	let [bookState,setBookState]=useState({page: 0, state: "read"});
	let innerFeather=useFeather(v=>innerRef.current.style=`transform: translateX(${v}%)`,{
		value: FrontPage?-25:0
	});

	/*if (dimensions)
		console.log(dimensions,dimensions[0]/dimensions[1]);*/

	if (!children.length)
		children.push(<div/>);

	if (children.length%2)
		children.push(<div/>);

	function getSpreadByPage(page) {
		if (!FrontPage)
			return Math.floor(page/2);

		if (!page)
			return 0;

		return (1+Math.floor((page-1)/2));
	}

	function getPageBySpread(spread) {
		if (!FrontPage)
			return (spread*2);

		if (!spread)
			return 0;

		return (1+(spread-1)*2);
	}

	function getNumSpreads() {
		let numSpreads=Math.round(children.length/2);

		if (FrontPage)
			numSpreads++;

		if (BackPage)
			numSpreads++;

		return numSpreads;
	}

	if (FrontPage && bookState.page==0 && bookState.state!="flipping")
		innerFeather.setTarget(-25);

	else if (BackPage && getSpreadByPage(bookState.page)>=getNumSpreads()-1 && bookState.state!="flipping")
		innerFeather.setTarget(25);

	else
		innerFeather.setTarget(0);

	pageAspectRatio=parseFloat(pageAspectRatio);
	logicPageWidth=parseFloat(logicPageWidth);

	if (!pageAspectRatio || isNaN(pageAspectRatio))
		pageAspectRatio=1;

	if (!logicPageWidth || isNaN(logicPageWidth))
		logicPageWidth=400;

	let scale=0;
	if (dimensions)
		scale=(dimensions[0]/2)/logicPageWidth;

	//console.log("spreads: "+getNumSpreads());

	let theChildren=[];
	if (FrontPage)
		theChildren.push(<FrontPage/>);

	theChildren.push(...children);
	if (BackPage)
		theChildren.push(<BackPage/>);

	let pageStyle={
		width: Math.round(logicPageWidth)+"px",
		height: Math.round(logicPageWidth/pageAspectRatio)+"px",
		position: "absolute",
		backgroundColor: pageColor
	}

	let wrappedChildren=theChildren.map(child=>
		<div style={`position: relative`}>
			<div style={`transform: scale(${scale}); transform-origin: top left; position: absolute`}>
				<div style={pageStyle}>
					{child}
				</div>
			</div>
		</div>
	)

	let containerStyle={
		aspectRatio: (pageAspectRatio*2).toString(),
		userSelect: "none",
		position: "relative",
	};

	let innerStyle={
		position: "absolute",
		top: "0",
		left: "0",
		right: "0",
		bottom: "0"
	}

	if (spreadIndexVar &&
			spreadIndexVar.get()>=getNumSpreads())
		spreadIndexVar.set(getNumSpreads()-1);

	if (spreadIndexVar &&
			bookState.state=="read" &&
			bookState.page!=getPageBySpread(spreadIndexVar.get())) {
		bookRef.current.pageFlip().flip(getPageBySpread(spreadIndexVar.get()));
	}

	let showLeftShadow=true;
	if (FrontPage && bookState.page==0)
		showLeftShadow=false;

	if (FrontPage && bookState.page==1 && bookState.state!="read")
		showLeftShadow=false;

	/*console.log("spread: "+getSpreadByPage(bookState.page));
	console.log("numspread: "+getNumSpreads());*/

	let showRightShadow=true;
	if (BackPage && getSpreadByPage(bookState.page)>=getNumSpreads()-1)
		showRightShadow=false;

	if (BackPage && getSpreadByPage(bookState.page)>=getNumSpreads()-2  && bookState.state!="read")
		showRightShadow=false;

	function onFlip(ev) {
		bookState.page=ev.data;
		setBookState({...bookState});
	}

	function onChangeState(ev) {
		bookState.state=ev.data;
		if (bookState.state=="read" &&
				spreadIndexVar) {
			spreadIndexVar.set(getSpreadByPage(bookState.page));
		}

		setBookState({...bookState});
	}

	return (
		<div style={containerStyle} ref={containerRef}>
			<div style={innerStyle} ref={innerRef}>
				{showLeftShadow &&
					<div style={`position: absolute; width: 50%; height: 100%; left: 0; top: 0; box-shadow: ${SHADOW_LG}`}/>
				}
				{showRightShadow &&
					<div style={`position: absolute; width: 50%; height: 100%; right: 0; top: 0; box-shadow: ${SHADOW_LG}`}/>
				}
				{dimensions &&
					<HtmlFlipBook
							width={Math.floor(dimensions[0]/2)}
							height={dimensions[1]}
							size="stretch"
							startZIndex={50}
							showCover={!!FrontPage}
							onFlip={onFlip}
							onChangeState={onChangeState}
							ref={bookRef}>
						{wrappedChildren}
					</HtmlFlipBook>
				}
			</div>
		</div>
	)
}

function FlipBookPreview({pageAspectRatio, logicPageWidth, children, pageColor}) {
	if (!pageColor)
		pageColor="#fff";

	let innerRef=useRef();
	let dimensions=useElementDimensions(innerRef);
	pageAspectRatio=parseFloat(pageAspectRatio);
	logicPageWidth=parseFloat(logicPageWidth);

	if (!pageAspectRatio || isNaN(pageAspectRatio))
		pageAspectRatio=1;

	if (!logicPageWidth || isNaN(logicPageWidth))
		logicPageWidth=400;

	let containerStyle={
		aspectRatio: (pageAspectRatio*2).toString(),
		position: "relative",
		backgroundColor: pageColor
	};

	let pageStyle={
		width: Math.round(logicPageWidth)+"px",
		height: Math.round(logicPageWidth/pageAspectRatio)+"px",
		position: "absolute",
	}

	let scale=0;
	if (dimensions)
		scale=(dimensions[0]/2)/logicPageWidth;

	return (
		<div style={containerStyle}>
			<div style={`position: absolute; top: 0; left: 0; bottom: 0; right: 0; box-shadow: ${SHADOW_LG}`} ref={innerRef}>
				<div style={`transform: scale(${scale}); transform-origin: top left; position: absolute`}>
					<div style={pageStyle}>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}

FlipBook.editorPreview=FlipBookPreview;
FlipBook.category="Animation";
FlipBook.materialSymbol="import_contacts";
FlipBook.containerType="children";
FlipBook.controls={
	frontPage: {type: "block"},
	backPage: {type: "block"},
	logicPageWidth: {},
	pageAspectRatio: {},
	pageColor: {},
	spreadIndex: {type: "var"},
}
