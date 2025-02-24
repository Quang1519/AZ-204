import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, useParams } from '@remix-run/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { AnswerOptions } from '~/components/AnswerOptions'
import { Button } from '~/components/Button'
import { TextInput } from '~/components/Input'
import { RichMarkdown } from '~/components/RichMarkdown'
import { getQuestionsByTopic } from '~/lib/qa'

export const loader = async ({ params }: LoaderFunctionArgs) => {
	return getQuestionsByTopic(params.name || '')
}

export const meta: MetaFunction = ({ params }) => {
	return [{ title: `Developing Solutions for Microsoft Azure: ${params.name}` }]
}

export default function Topic() {
	const questions = useLoaderData<typeof loader>()
	const params = useParams()

	useEffect(() => {
		getParameter()
	})

	const [index, setIndex] = useState(0)

	const getParameter = () => {
		const currentURL = new URL(window.location.href)
		const data = currentURL.searchParams.get('number') || "1"
		setIndex(() => Number(data) - 1) 
	}

	const setParam = (index: Number) => {
		const currentURL = new URL(window.location.href)
		const searchParams = new URLSearchParams(currentURL.search)
		searchParams.set('number', (Number(index) + 1).toString())
		currentURL.search = searchParams.toString()
		window.history.replaceState({}, null!, currentURL.toString())
	}

	const [checkedValues, setCheckedValues] = useState<number[]>([])
	const [showAnswer, setShowAnswer] = useState(false)

	const question = index < questions.length ? questions[index] : null

	const isCorrectlyAnswered =
		question &&
		question.answerIndexes &&
		question.answerIndexes.length > 0 &&
		question.answerIndexes.length == checkedValues.length &&
		question.answerIndexes.every((value) => checkedValues.includes(value))

	const buttonColor = showAnswer || isCorrectlyAnswered ? 'green' : 'blue'

	const handleSubmit = (e: any) => {
		e.preventDefault()
		setCheckedValues([])
		setShowAnswer(false)
		//setIndex((index) => index + 1)
		// window.scrollTo(0, 0);
		setParam(index + 1)
		return false
	}

	return (
		<Form method="post" onSubmit={handleSubmit}>
			<h2 className="mt-0 text-center">
				<Link to={`/topics`}>← Back to Topics</Link>
			</h2>
			{question ? (
				<>
					<div className="text-2x">
						<span className="font-bold">
							{params.name} ({index + 1} / {questions.length}):{' '}
						</span>
						<RichMarkdown interactive children={question.question} />
					</div>
					{question.options && question.options.length > 0 && (
						<AnswerOptions
							name="answers"
							options={question.options}
							checkedValues={checkedValues}
							setCheckedValues={setCheckedValues}
							showAnswer={showAnswer}
							answerIndexes={question.answerIndexes}
							disabled={showAnswer}
						/>
					)}
					{question.answerIndexes && question.answerIndexes.length > 1 && (
						<div className="text-xs italic text-gray-400">
							Note: This question has more than one correct answer
						</div>
					)}
					{(!question.options || !question.options.length) &&
						!question.hasCode && <TextInput />}

					<div
						className={clsx(
							'mt-4 overflow-hidden transition-[opacity] duration-500 ease-in-out',
							showAnswer ? 'h-auto opacity-100' : 'h-0 opacity-0',
						)}
					>
						<div className="font-bold">Answer: </div>
						<RichMarkdown children={question.answer} />
					</div>
					<div className="mt-12 flex justify-between">
						<Button
							type="button"
							onClick={() => setShowAnswer((ans) => !ans)}
							bgColor={buttonColor}
						>
							{!showAnswer ? 'Show' : 'Hide'} Answer
						</Button>
						<Button bgColor={buttonColor} type="submit" onSubmit={handleSubmit}>
							Next
						</Button>
					</div>
				</>
			) : (
				<div className="text-center text-7xl italic">All done! 🎉</div>
			)}
		</Form>
	)
}
