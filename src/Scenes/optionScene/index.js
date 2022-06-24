import React, { useEffect, useRef, useContext, useState } from 'react';
import "../../stylesheets/styles.css";
import BaseImage from '../../components/BaseImage';
import { UserContext } from '../../components/BaseShot';
import { getAudioPath, prePathUrl, setExtraVolume, setPrimaryAudio, setRepeatAudio, setRepeatType, startRepeatAudio, stopRepeatAudio } from "../../components/CommonFunctions";

import { SIGNALLIST } from "../../components/CommonVarariant"


let answerList = []

let optionList = [0, 1]
let optionType = 0;

let correctNum = 0
let doneCount = 0



const posInfoList = [
    { f: '1', wN: '1', x: 25 },
    { f: '1', wN: '2', x: 60 },

    { f: '2', wN: '1', x: 4 },
    { f: '2', wN: '2', x: 29 },
    { f: '2', wN: '3', x: 54 },
    { f: '2', wN: '4', x: 79 },
]

let stepCount = 0;
let optionGroup = [2, 4]


const iconMovePosList = [
    [25, 60],
    [4, 29, 54, 78.5]

]

let timerList = []

let disableState = false;

let isFirstPartShow = false;

const osIndex = 32

let qAudio, aAudio

const OptionScene = React.forwardRef(({ nextFunc, transSignaler, _geo, continueSecondPart }, ref) => {

    const optionLength = posInfoList.length

    const audioList = useContext(UserContext)
    const parentObject = useRef();

    const textRefList = Array.from({ length: optionLength }, ref => useRef())
    const clickRefList = Array.from({ length: optionLength }, ref => useRef())
    const itemRefList = Array.from({ length: optionLength }, ref => useRef())

    const [isShowLastPart, setShowLastPart] = useState(false)

    useEffect(() => {
        setPositionFomart()


        return () => {
            answerList = []
            optionType = 0;
            stepCount = 0;
        }
    }, [])

    React.useImperativeHandle(ref, () => ({
        continueGame: () => {


            qAudio = audioList[osIndex + stepCount + doneCount]
            aAudio = audioList[osIndex + stepCount + doneCount + 1]

            setExtraVolume(qAudio, 8)
            setExtraVolume(aAudio, 8)

            setPrimaryAudio(qAudio)
            setRepeatAudio(audioList.commonAudio1)

            parentObject.current.className = 'appear'
            parentObject.current.style.pointerEvents = ''
            timerList[0] = setTimeout(() => {
                qAudio.play();
                timerList[1] = setTimeout(() => {
                    aAudio.play();
                    timerList[2] = setTimeout(() => {
                        startRepeatAudio()
                        audioList.commonAudio1.play();
                    }, aAudio.duration * 1000 + 300);
                }, qAudio.duration * 1000 + 300);
            }, 1500);
        },
        startGame: () => {

            qAudio = audioList[osIndex]
            aAudio = audioList[osIndex + 1]

            setExtraVolume(qAudio, 8)
            setExtraVolume(aAudio, 8)

            setPrimaryAudio(qAudio)
            setRepeatAudio(audioList.commonAudio1)
            setRepeatType(1)

            timerList[0] = setTimeout(() => {
                qAudio.play();
                timerList[1] = setTimeout(() => {
                    aAudio.play();
                    timerList[2] = setTimeout(() => {
                        startRepeatAudio()
                        audioList.commonAudio1.play();
                    }, aAudio.duration * 1000 + 300);
                }, qAudio.duration * 1000 + 600);
            }, 1500);
        }
    }))



    const clickFunc = (num) => {
        stopRepeatAudio();

        qAudio.pause()
        aAudio.pause()

        audioList.buzzAudio.pause();

        timerList.map(timer => clearTimeout(timer))

        clickRefList[num].current.style.transition = '0.5s'
        clickRefList[num].current.style.transform = 'scale(0.7)'

        setTimeout(() => {
            clickRefList[num].current.style.transform = 'scale(1)'
            setTimeout(() => {
                judgeFunc(num)
            }, 150);
        }, 100);

        setShowLastPart(true)
    }

    const setPositionFomart = () => {

        for (let i = 0; i < answerList.length; i++) {
            clickRefList[doneCount + i].current.style.left =
                posInfoList[answerList[i]].x + '%'
            clickRefList[doneCount + i].current.style.transition = '0s'
        }
    }

    const goNextStep = () => {

        doneCount += optionGroup[stepCount]
        transSignaler(SIGNALLIST.increaseMark)

        setTimeout(() => {
            if (stepCount < optionGroup.length - 1) {

                correctNum = 0;
                stepCount++;


                let waitTime = 500
                if (stepCount == 1) {
                    disableState = true
                    waitTime = 2500
                    setTimeout(() => {
                        continueSecondPart()
                    }, 2000);
                }
                else {
                    disableState = false
                    parentObject.current.className = 'disapear'
                }

                setTimeout(() => {

                    optionType = optionList[stepCount]

                    getRandomAnswerList()

                    itemRefList.map((value, index) => {
                        if (index > doneCount - 1) {
                            if (stepCount != optionGroup.length - 1 && index < doneCount + optionGroup[stepCount]) {
                                if (index == doneCount)
                                    value.current.className = 'showObject'
                                clickRefList[index].current.className = 'showObject'
                            }
                            if (stepCount == optionGroup.length - 1) {
                                if (index == doneCount)
                                    value.current.className = 'showObject'
                                clickRefList[index].current.className = 'showObject'
                            }
                        }
                        else {
                            value.current.className = 'hideObject'
                            clickRefList[index].current.className = 'hideObject'
                        }
                    })

                    setPositionFomart();

                    if (!disableState) {
                        parentObject.current.className = 'appear'
                        parentObject.current.style.pointerEvents = ''

                        qAudio = audioList[osIndex + doneCount + stepCount]
                        aAudio = audioList[osIndex + doneCount + stepCount + 1]


                        setExtraVolume(aAudio, 8)
                        setExtraVolume(qAudio, 8)

                        timerList[0] = setTimeout(() => {
                            qAudio.play();
                            timerList[1] = setTimeout(() => {
                                aAudio.play();
                                timerList[2] = setTimeout(() => {
                                    startRepeatAudio()
                                }, aAudio.duration * 1000 + 300);
                            }, qAudio.duration * 1000 + 300);
                        }, 1500);
                    }
                }, waitTime);
            }

            else {
                setTimeout(() => {
                    nextFunc()
                }, 3000);
            }
        }, 1000);
    }

    const getRandomAnswerList = () => {

        answerList = []
        let needLength = optionGroup[stepCount];

        const defaultRandomList = [
            [
                [1, 0]
            ],
            [
                [2, 0, 1], [1, 2, 0]
            ],
            [
                [3, 2, 1, 0], [3, 2, 0, 1],
                [1, 0, 3, 2], [3, 0, 1, 2],
                [2, 3, 1, 0], [2, 3, 0, 1]
            ]
        ]

        let currentNum = needLength - 2

        let randomNumber = Math.floor(Math.random() * defaultRandomList[currentNum].length);

        defaultRandomList[currentNum][randomNumber].map(value => {
            answerList.push(value + doneCount)
        })
    }

    if (answerList.length == 0)
        getRandomAnswerList()

    const judgeFunc = (num) => {
        if (num == doneCount + correctNum) {

            parentObject.current.style.pointerEvents = 'none'
            clickRefList[num].current.style.zIndex = (1000 + doneCount)

            clickRefList[num].current.style.pointerEvents = 'none'
            clickRefList[num].current.style.transition = '0.8s'

            clickRefList[num].current.style.left = iconMovePosList[optionType][correctNum] + '%'
            clickRefList[num].current.style.top = '47%'

            correctNum++

            audioList.tingAudio.currentTime = 0;
            audioList.tingAudio.play();


            if (correctNum == answerList.length) {
                setTimeout(() => {
                    goNextStep()
                }, 1000);

            }

            else {

                transSignaler(SIGNALLIST.loadSecondPart)  // loadSecond part...
                aAudio = audioList[osIndex + doneCount + stepCount + 1 + correctNum]
                setExtraVolume(aAudio, 8)

                timerList[0] = setTimeout(() => {
                    itemRefList[doneCount + correctNum].current.className = 'appear'
                    parentObject.current.style.pointerEvents = ''

                    aAudio.play()

                    timerList[2] = setTimeout(() => {
                        setPrimaryAudio(aAudio)
                        startRepeatAudio()
                    }, aAudio.duration * 1000 + 300);
                }, 1500);
            }
        }
        else {
            audioList.buzzAudio.currentTime = 0;
            audioList.buzzAudio.play();

            timerList[1] = setTimeout(() => {
                aAudio.currentTime = 0;
                aAudio.play();
                timerList[2] = setTimeout(() => {
                    startRepeatAudio()
                }, aAudio.duration * 1000);
            }, 1000);
        }
    }

    return (
        <div ref={parentObject}
            style={{
                position: "fixed", width: _geo.width + "px"
                , height: _geo.height + "px",
                left: _geo.left + 'px',
                top: _geo.top + 'px',
            }}
        >



            {
                posInfoList.map((value, index) =>
                    (isShowLastPart || index < optionGroup[0]) &&


                    <div
                        key={index}
                        ref={itemRefList[index]}
                        style={{
                            position: "absolute",
                            width: '100%'
                            , height: '100%',
                            left: 0 + '%',
                            top: '0%',
                            pointerEvents: 'none'
                        }}
                        className={index == 0 ? '' : 'hideObject'}
                    >

                        <BaseImage
                            scale={0.22}
                            posInfo={{
                                l: (posInfoList[index].x - 3) / 100,
                                b: 0.09
                            }}
                            ref={textRefList[index]}
                            url={"option/" + value.f + "/" + value.wN + "a.png"}
                        />
                    </div>


                )
            }
            {
                posInfoList.map((value, index) =>
                    (isShowLastPart || index < optionGroup[0]) &&
                    <div
                        className={index > optionGroup[0] - 1 ? 'hideObject' : ''}
                        ref={clickRefList[index]}
                        onClick={() => { clickFunc(index) }}
                        style={{
                            position: 'absolute',
                            top: 30 + '%',
                            width: 17 + '%',
                            height: 30 + '%',
                            borderRadius: '50%',
                            left: posInfoList[index].x + 0 + '%',
                            top: '16%',
                            cursor: 'pointer',
                        }}>
                        <BaseImage
                            posInfo={{ l: 0, t: 0 }}
                            url={"option/" + value.f + "/" + value.wN + ".png"}
                        />
                    </div>
                )
            }

        </div >
    );
});

export { OptionScene };
