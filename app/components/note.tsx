import { marked } from 'marked';
import type {
	Dispatch,
	DragEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
	SetStateAction,
} from 'react';
import { useEffect, useState } from 'react';

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
	const [priority, setPriority] = useState(note.priority);

	const [state, setState] = useState<State>('view');

	useEffect(() => {
		setTextContent(content);
	}, [content]);

	useEffect(() => {
		setIsCompleted(!!note.completedAt);
	}, [note.completedAt]);

	useEffect(() => {
		setPriority(note.priority);
	}, [note.priority]);

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

	function handleChangePriority(priority: string) {
		if (!isNaN(Number(priority)) && [1, 2, 3].includes(Number(priority))) {
			setPriority(Number(priority));
			fetch('/api/edit/note', {
				method: 'post',
				body: JSON.stringify({ id, priority: Number(priority) }),
			}).then(refetch);
		}
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
					className="flex-1 mx-4 outline-none cursor-pointer word-break"
					onClick={startEditing}
					dangerouslySetInnerHTML={{
						__html: marked(textContent, {
							mangle: false,
							headerIds: false,
						}),
					}}
				/>
			)}
			{priority && (
				<select
					value={[1, 2, 3].includes(priority) ? priority : 2}
					onChange={e => handleChangePriority(e.target.value)}
					className={`sm:mr-4 w-[25px] aspect-square align-last-center mx-2 text-center bg-blue-100 appearance-none cursor-pointer ${
						priority === 1 ? 'bg-pink-100' : ''
					} ${priority === 3 ? 'bg-green-100' : ''}`}
				>
					<option value={1}>↑</option>
					<option value={2}>·</option>
					<option value={3}>↓</option>
				</select>
			)}
			<button
				onClick={handleDelete}
				className="text-red-500 cursor-pointer"
			>
				{state === 'loading' ? '⏳' : 'x'}
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

	useEffect(() => {
		if (ref) {
			ref.style.height = `0px`;
			ref.style.height = `${ref.scrollHeight}px`;
		}
	}, [ref, textContent]);

	return (
		<textarea
			ref={setRef}
			autoFocus
			name="task_content"
			spellCheck
			className="flex-1 mx-4"
			value={textContent}
			onChange={e => setTextContent(e.target.value)}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
		/>
	);
}
