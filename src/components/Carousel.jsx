import {useElementDimensions} from "../utils/react-util.jsx"
import {useRef} from "react";
import {useFeather} from "use-feather";
import {useExpandChildren, useVar, useVal} from "katnip-components";

export function Carousel({indexVar, children}) {
	children=useExpandChildren(children);
	let containerRef=useRef();
	let innerRef=useRef();
	let dimensions=useElementDimensions(containerRef);
	let feather=useFeather(v=>innerRef.current.style.transform=`translateX(${v}px)`);
	let pageIndex=useVal(indexVar);
	if (!pageIndex)
		pageIndex=0;

	let containerStyle={
		overflow: "hidden",
		whiteSpace: "nowrap"
	}

	if (!dimensions) {
		dimensions=[0,0];
		containerStyle.visibility="hidden";
	}

	//console.log(pageIndex);

	feather.setTarget(-pageIndex*dimensions[0]);

	let childStyle={
		display: "inline-block",
		whiteSpace: "normal",
		verticalAlign: "middle",
		width: dimensions[0]+"px",
	}

	return (<>
		<div ref={containerRef} style={containerStyle}>
			<div ref={innerRef}>
				{children.map(child=>
					<div style={childStyle}>
						{child}
					</div>
				)}
			</div>
		</div>
	</>);
}

Carousel.editorPreview=({children})=><div>{children}</div>;
Carousel.category="Animation";
Carousel.materialSymbol="view_carousel";
Carousel.controls={
	indexVar: {type: "var"},
}
