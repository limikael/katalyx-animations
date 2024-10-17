import {useExpandChildren, useComponentLibrary, useVarExpr, Env} from "katnip-components";
import {useFeather} from "use-feather";
import {useRef, useState} from "react";
import {ResolvablePromise} from "../utils/js-util.js";

export function ModalPopup({children, onDismiss, class: className, style}) {
	let coverRef=useRef();
	let coverFeather=useFeather(v=>{
		coverRef.current.style.backgroundColor=`rgba(0,0,0,${v/200})`;
		coverRef.current.style.opacity=`${v}%`;
	});

	let contentRef=useRef();
	let contentFeather=useFeather(v=>{
		contentRef.current.style.transform=`translateY(${Math.round(100-v)}px)`;
	},{
		stiffness: 250,
		damping: 25
	});

	coverFeather.setTarget(100);
	contentFeather.setTarget(100);

	// class="fixed top-0 left-0 bg-black w-full h-[100dvh] z-50 flex items-center justify-center"
	let coverStyle={
		"display":"flex",
		"position":"fixed",
		"top":"0",
		"left":"0",
		"zIndex":50,
		"justifyContent":"center",
		"alignItems":"center",
		"width":"100%",
		"backgroundColor":"#000000",
		"height":"100dvh"		
	};

	// class="w-full sm:w-[640px] max-h-[100dvh] inline-flex flex-col overflow-hidden p-10 relative"
	let popupStyle={
		"display":"inline-flex",
		"overflow":"hidden",
		"position":"relative",
		"padding":"2.5rem",
		"flexDirection":"column",
		"maxHeight":"100dvh",
		"width":"100%",
		"max-width": "640px"
	}

	return (
		<div style={coverStyle}
				ref={coverRef}
				onClick={onDismiss}>
			<div style={popupStyle}
					onClick={e=>e.stopPropagation()}
					ref={contentRef}>
				<div class={className} style={style}>
					{children}
				</div>
			</div>
		</div>
	);
}

export function Modal({children, block}) {
	let componentLibrary=useComponentLibrary();
	let Block=componentLibrary[block];
	let [showing,setShowing]=useState();
	let promiseRef=useRef();

	function show() {
		setShowing(true);
	}

	function hide() {
		setShowing(false);
		if (promiseRef.current)
			promiseRef.current.resolve();
	}

	function ok() {
		setShowing(false);
		if (promiseRef.current)
			promiseRef.current.resolve(true);
	}

	function cancel() {
		setShowing(false);
		if (promiseRef.current)
			promiseRef.current.resolve(false);
	}

	async function confirm(ev) {
		promiseRef.current=new ResolvablePromise();
		setShowing(true);
		let res=await promiseRef.current;
		promiseRef.current=null;

		if (!res) {
			console.log("preventing...");
			ev.preventDefault();
		}
	}

	return (
		<div>
			<Env actions={{show, hide, confirm}}>{children}</Env>
			{showing &&
				<Env actions={{ok, cancel}}>
					<ModalPopup onDismiss={()=>hide()}><Block/></ModalPopup>
				</Env>
			}
		</div>
	);
}

Modal.editorPreview=({children})=><div>{children}</div>;
Modal.category="Animation";
Modal.materialSymbol="domain_verification";
Modal.containerType="children";
Modal.envSpec=(props,envSpec)=>{
	return ({
		show: {type: "action"},
		hide: {type: "action"},
		confirm: {type: "action"}
	});
}
Modal.controls={
};
