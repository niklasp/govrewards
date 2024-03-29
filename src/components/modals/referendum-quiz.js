import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from 'react-toastify';
import useAppStore from "../../zustand";

export default function ReferendumQuizModal( { id, title, questions } ) {
  const { openModal } = useModal();
  const { closeModal } = useModal();

  const submitQuiz = useAppStore( ( state ) => state.submitQuiz )
  const updateQuizAnswers = useAppStore( ( state ) => state.updateQuizAnswers )
  const userAnswers = useAppStore( ( ( state ) => state.user.quizAnswers[id] ) )

  const isFormFilled = userAnswers?.answers && Object.keys(userAnswers.answers).length === questions.length

  async function onSend() {
    if ( ! isFormFilled ) {
      return
    }
    submitQuiz( id )
    toast( 'Quiz answers stored, please submit your vote to complete the process')

    // toast.promise(
    //   submitQuiz( id ),
    //   {
    //     pending: `sending your quiz answers for referendum ${ id }`,
    //     success: 'answers successfully recorded 🗳️',
    //     error: 'error recording answers 🤯'
    //   }
    // ).then( () => {
      closeModal()
      openModal('VIEW_REFERENDUM_VOTE', {id, title, userAnswers})
    // } );
  }

  function onChangeInputs( e, questionIndex, multiple ) {
    let qAnswer = null;
    const checkboxes = document.querySelectorAll(`[name=ref${id}question${questionIndex}]`)
    qAnswer = [ ...checkboxes ].reduce(
      ( prev, cur, idx ) => {
      return [ ...prev, cur.checked ];
      },
      []
    )

    const newUserAnswers = {
      [`${ questionIndex }`]: qAnswer,
    }
    updateQuizAnswers( id, newUserAnswers );
  }

  return(
    <>
      <Dialog.Title as="h3" className="text-xl font-medium leg-6 text-gray-900">
        Quiz for Referendum { id }
      </Dialog.Title>
      <div className="mt-1 text-sm">
        { title }
      </div>
      { ! questions ?
        <div className="min-h-[200px] flex justify-center items-center">Loading...</div>
      :
        <>
          <form className="mt-4 pr-4 overflow-y-scroll flex-1">
            { questions.map( ( { question, answers, multiple }, i) => {
              multiple = multiple === "true" || multiple === true
              const selectOptions = answers.map( (a,j) => {
                return {
                  value: j,
                  label: a,
                  // bind the checked value of the inputs to state values
                  checked: userAnswers?.answers?.[i] && userAnswers?.answers?.[i][j],
                }
              })

              return (
                <fieldset
                  key={ `quiz-${i}`}
                  className="px-4 pt-2 pb-3 font-semibold border-2 border-gray-400 hover:border-gray-500 hover:shadow-lg transition rounded-md my-6"
                >
                  <legend className="px-3">{ question }</legend>
                  <Input
                    type={ multiple ? 'checkbox' : 'radio' }
                    id={`r${id}q${i}`}
                    name={ `ref${id}question${i}` }
                    options={ selectOptions }
                    onChange={ (e) => onChangeInputs( e, i, multiple ) }
                  />
                </fieldset>
              )
            })
          }
          </form>

            <div className="mt-4">
              <Button
                className="mr-2"
                variant={ isFormFilled ? 'primary' : 'disabled' }
                disabled={ ! isFormFilled }
                onClick={ onSend }
              >
                Submit
              </Button>
              <Button
                variant="calm"
                onClick={ closeModal }>
                Cancel
              </Button>
            </div>
        </>
      }
    </>
  )
}