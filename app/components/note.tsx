import {
	ChangeEventHandler,
	DragEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
	useRef,
} from 'react';
import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

export type UINote = {
	id: string;
	content: string;
	completedAt: string | null;
};

interface Props {
	note: UINote;
	refetch: () => void;
}

function handleSave(id: string, newContent: string) {
	return fetch('/api/edit/note', {
		method: 'post',
		body: JSON.stringify({ id, content: newContent }),
	});
}

const debouncedHandleSave = debounce(handleSave, 5_000);

function resizeEl(el: HTMLTextAreaElement) {
	el.style.height = 'inherit';
	el.style.height = `${el.scrollHeight}px`;
}

const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = e => {
	resizeEl(e.currentTarget);

	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

const handleFocus: FocusEventHandler<HTMLTextAreaElement> = e => {
	resizeEl(e.currentTarget);
};

export function Note({ note, refetch }: Props) {
	const { id, content, completedAt } = note;

	const el = useRef<HTMLTextAreaElement>(null);

	const [textContent, setTextContent] = useState(content);

	useEffect(() => {
		setTextContent(content);
	}, [content]);

	useEffect(() => {
		if (el.current) {
			resizeEl(el.current);
		}
	}, []);

	const handleChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
		setTextContent(e.currentTarget.value);
		debouncedHandleSave(id, e.currentTarget.value);
	};

	function handleDelete() {
		const shouldProceed = confirm(
			`Are you sure you want to delete "${textContent}"?`,
		);
		if (shouldProceed) {
			fetch('/api/delete/note', {
				method: 'post',
				body: JSON.stringify({ id }),
			}).then(refetch);
		}
	}

	function handleToggle(isComplete: boolean) {
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({ id, isComplete }),
		}).then(refetch);
	}

	const handleDrag: DragEventHandler<HTMLDivElement> = e => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('note', id);

		e.stopPropagation();
	};

	const handleBlur: FocusEventHandler<HTMLTextAreaElement> = async e => {
		debouncedHandleSave(id, e.target.value);
		await debouncedHandleSave.flush();
		refetch();
	};

	return (
		<div
			className={`flex items-center px-4 py-2 transition-colors rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100`}
			onDragStart={handleDrag}
			draggable={!completedAt}
		>
			<input
				type="checkbox"
				checked={!!completedAt}
				onChange={e => handleToggle(e.target.checked)}
			/>
			<textarea
				ref={el}
				className="flex-1 mx-4 overflow-hidden bg-transparent outline-none resize-none"
				value={textContent}
				rows={1}
				onBlur={handleBlur}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
			/>
			<span
				onClick={handleDelete}
				className="text-red-500 cursor-pointer"
			>
				x
			</span>
		</div>
	);
}
