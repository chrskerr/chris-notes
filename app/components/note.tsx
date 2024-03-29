import { marked } from 'marked';
import type {
	Dispatch,
	DragEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
	SetStateAction,
} from 'react';
import { useEffect, useRef, useState } from 'react';

export type UINote = {
	id: string;
	content: string;
	completedAt: string | null;
	priority?: number;
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

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

type State = 'view' | 'edit' | 'loading';

export function Note({ note, refetch }: Props) {
	const { id, content } = note;
	const [textContent, setTextContent] = useState(content);

	const [isCompleted, setIsCompleted] = useState(!!note.completedAt);
	const [priority, setPriority] = useState<string>(
		note.priority?.toString() ?? '1',
	);

	const [state, setState] = useState<State>('view');

	useEffect(() => {
		setTextContent(content);
	}, [content]);

	useEffect(() => {
		setIsCompleted(!!note.completedAt);
	}, [note.completedAt]);

	useEffect(() => {
		setPriority(note.priority?.toString() ?? '1');
	}, [note.priority]);

	useEffect(() => {
		if (!note.content) {
			setState('edit');
		}
	}, []);

	const handleBlur = async () => {
		setState('loading');
		handleSave(id, textContent)
			.then(refetch)
			.finally(() => setState('view'));
	};

	const handleDelete: MouseEventHandler<HTMLSpanElement> = e => {
		e.stopPropagation();
		const shouldProceed = confirm(
			`Are you sure you want to delete "${textContent}"?`,
		);
		if (shouldProceed) {
			setState('loading');
			fetch('/api/delete/note', {
				method: 'post',
				body: JSON.stringify({ id }),
			}).then(refetch);
		}
	};

	function handleToggle(isComplete: boolean) {
		setIsCompleted(isComplete);
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({ id, isComplete }),
		}).then(refetch);
	}

	function saveChangeOfPriority() {
		if (isNaN(Number(priority))) {
			return;
		}

		setState('loading');
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({
				id,
				priority: Math.max(Math.min(Number(priority), 999), 1),
			}),
		})
			.then(refetch)
			.finally(() => setState('view'));
	}

	const handleDrag: DragEventHandler<HTMLDivElement> = e => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('note', id);

		e.stopPropagation();
	};

	const startEditing: MouseEventHandler<HTMLDivElement> = e => {
		if ((e.target as HTMLElement).tagName === 'A') return;

		e.preventDefault();
		setState('edit');
	};

	return (
		<div
			className="note flex items-center pl-[6px] pr-2 py-2 transition-colors rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100 sm:pr-4"
			onDragStart={handleDrag}
			draggable={!isCompleted}
		>
			<input
				type="checkbox"
				checked={isCompleted}
				onChange={e => handleToggle(e.target.checked)}
			/>
			{state === 'edit' ? (
				<Input
					textContent={textContent}
					setTextContent={setTextContent}
					handleBlur={handleBlur}
				/>
			) : (
				<span
					className={`self-stretch flex-1 mx-4 outline-none cursor-text word-break ${
						isCompleted ? 'line-through' : ''
					}`}
					onClick={startEditing}
					dangerouslySetInnerHTML={{
						__html: marked(textContent, {
							mangle: false,
							headerIds: false,
						}),
					}}
				/>
			)}
			<input
				value={priority}
				type="number"
				inputMode="numeric"
				onChange={e => setPriority(e.target.value)}
				onKeyUp={e => {
					if (e.key === 'Enter') {
						e.currentTarget.blur();
					}
				}}
				onBlur={saveChangeOfPriority}
				className="sm:mr-4 w-[2rem] mx-2 text-center bg-blue-100 cursor-pointer"
			/>
			<button
				onClick={handleDelete}
				className="text-red-500 origin-center cursor-pointer aria-[busy=true]:animate-spin"
				aria-busy={state === 'loading'}
			>
				x
			</button>
		</div>
	);
}

function Input({
	textContent,
	setTextContent,
	handleBlur,
}: {
	textContent: string;
	setTextContent: Dispatch<SetStateAction<string>>;
	handleBlur: () => void;
}) {
	const [node, setNode] = useState<HTMLTextAreaElement | null>(null);
	const ref = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (node) {
			node.style.height = `0px`;
			node.style.height = `${node.scrollHeight}px`;
			node.focus();
		}
		ref.current = node;
	}, [node, textContent]);

	useEffect(() => {
		const onClickOutside = (e: Event) => {
			if (
				ref.current &&
				e.target &&
				!ref.current.contains(e.target as Node)
			) {
				ref.current.blur();
			}
		};

		document.addEventListener('click', onClickOutside, false);

		return () => {
			document.removeEventListener('click', onClickOutside);
		};
	}, []);

	return (
		<textarea
			ref={setNode}
			autoFocus
			name="task_content"
			spellCheck
			className="flex-1 px-2 mx-2"
			value={textContent}
			onChange={e => setTextContent(e.target.value)}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
		/>
	);
}
