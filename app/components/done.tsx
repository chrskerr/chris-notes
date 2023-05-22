import type { UINote } from './note';
import { Note } from './note';
import { memo } from 'react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import isEqual from 'fast-deep-equal';

interface Props {
	data: UINote[];
	refetch: () => void;
}

type NoteGroup = { label: string; notes: UINote[] };

function categoriseNotesByDate(notes: UINote[]): NoteGroup[] {
	const doneMap = new Map<string, { label: string; notes: UINote[] }>();
	for (const note of notes) {
		if (!note.completedAt) continue;
		const label = format(
			utcToZonedTime(note.completedAt, 'Australia/Brisbane'),
			'EEE dd MMMM yyyy',
		);
		const existing = doneMap.get(label) ?? { label, notes: [] };
		doneMap.set(label, { ...existing, notes: existing.notes.concat(note) });
	}

	return [...doneMap.values()];
}

export const Done = ({ data, refetch }: Props) => {
	if (data.length === 0) {
		return null;
	}

	const categorisedData = categoriseNotesByDate(data);

	return (
		<div className="pt-2">
			{categorisedData.map(noteGroup => (
				<DoneGroup
					key={noteGroup.label}
					noteGroup={noteGroup}
					refetch={refetch}
				/>
			))}
		</div>
	);
};

function DoneGroup({
	noteGroup,
	refetch,
}: {
	noteGroup: NoteGroup;
	refetch: () => void;
}) {
	return (
		<details key={noteGroup.label} className="mb-3">
			<summary className="pb-1 pl-2">
				<span className="pl-[9px]">
					{noteGroup.label} ({noteGroup.notes.length})
				</span>
			</summary>
			{noteGroup.notes.map(note => (
				<Note key={note.id} note={note} refetch={refetch} />
			))}
		</details>
	);
}
