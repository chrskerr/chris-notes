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

function categoriseNotesByDate(
	notes: UINote[],
): Array<{ label: string; notes: UINote[] }> {
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

export const Done = memo(
	function Done({ data, refetch }: Props) {
		if (data.length === 0) {
			return null;
		}

		const categorisedData = categoriseNotesByDate(data);

		return (
			<details className="p-1 pl-2 mb-4 border border-dashed rounded">
				<summary className="flex items-center pl-2">
					<span className="flex-1 pr-4 pl-[9px] py-2 text-xl outline-none">
						Done
					</span>
				</summary>
				<div className="pt-2 pl-[30px]">
					{categorisedData.map(noteGroup => (
						<details key={noteGroup.label} className="mb-3">
							<summary className="pb-1 pl-2">
								<span className="pl-[9px]">
									{noteGroup.label} ({noteGroup.notes.length})
								</span>
							</summary>
							{noteGroup.notes.map(note => (
								<Note
									key={note.id}
									note={note}
									refetch={refetch}
								/>
							))}
						</details>
					))}
				</div>
			</details>
		);
	},
	(prevProps, newProps) => isEqual(newProps.data, prevProps.data),
);
