import React, { useEffect, useRef, useContext, useState } from 'react';
import "../stylesheets/styles.css";
import BaseImage from '../components/BaseImage';
import { UserContext } from '../components/BaseShot';
import { getAudioPath, setExtraVolume, setPrimaryAudio, setRepeatAudio, setRepeatType, startRepeatAudio, stopRepeatAudio } from "../components/CommonFunctions"
import { prePathUrl } from "../components/CommonFunctions";
import { OptionScene } from "./optionScene"
import { SIGNALLIST } from '../components/CommonVarariant';

let timerList = []
let stepCount = 0;

let totalStep = 0

const questionPartCount = 8
const firstContinueNum = 8
const firstStartNum = 4

let isDisabled = false;

let cIndex = 0;
let isEven = true;

const qsIndex = 16

const Scene = React.forwardRef(({ nextFunc, _baseGeo, _geo, loadFunc }, ref) => {

    const audioList = useContext(UserContext)

    const firstPartRef = useRef()
    const secondPartRef = useRef();

    const blackWhiteObject = useRef();
    const baseColorImgRef = useRef();
    const buttonRefs = useRef()
    const starRefs = Array.from({ length: 10 }, ref => useRef())
    const optionRef = useRef()

    const aniImageLists = [
        Array.from({ length: 4 }, ref => useRef()),
        Array.from({ length: 4 }, ref => useRef())
    ]

    const [isSecondShow, setSecondShow] = useState(true)
    const [isFirstShow, setFirstShow] = useState(false)

    const [isSceneLoad, setSceneLoad] = useState(false)
    const parentRef = useRef()
    const [isLastLoaded, setLastLoaded] = useState(false)

    React.useImperativeHandle(ref, () => ({
        sceneLoad: () => {
            setSceneLoad(true)
        },
        sceneStart: () => {

            setExtraVolume(audioList.commonAudio2, 4)
            setExtraVolume(audioList.commonAudio1, 4)

            for (let i = qsIndex; i < qsIndex + 16; i++)
                setExtraVolume(audioList[i], 8)

            parentRef.current.className = 'aniObject'
            setRepeatType(1)
            startSecondPart()
            loadFunc()
        },
        sceneEnd: () => {
            setSceneLoad(false)
            stepCount = 0;
            totalStep = 0
            stopRepeatAudio()
        }
    }))

    const playZoomAnimation = () => {

        let imageNum = 0;
        blackWhiteObject.current.className = 'hideMask'
        baseColorImgRef.current.setClass('hideObject')

        aniImageLists[cIndex][0].current.setClass('showObject')
        let imageShowInterval = setInterval(() => {
            aniImageLists[cIndex][imageNum].current.setClass('hideObject')
            imageNum++
            aniImageLists[cIndex][imageNum].current.setClass('showobject')
            if (imageNum == 3) {
                clearInterval(imageShowInterval)
                showControlFunc()
            }
        }, 150);
    }

    const showControlFunc = () => {

        if (stepCount < 7)
            blackWhiteObject.current.style.WebkitMaskImage = 'url("' + prePathUrl() + 'images/question/' + (stepCount + 2) + '/m.png")'

        if (stepCount < 6)
            aniImageLists[cIndex].map((image, index) => {
                if (index < 3)
                    image.current.setUrl('question/' + (stepCount + 3) + '/' + (index + 1) + '.png')
            })


        timerList[2] = setTimeout(() => {
            if (stepCount == 0)
                audioList.commonAudio2.play();

            setPrimaryAudio(audioList[qsIndex + stepCount * 2])
            startRepeatAudio()

        }, 500);

        buttonRefs.current.className = 'show'
    }

    const returnBackground = () => {

        baseColorImgRef.current.setClass('show')
        buttonRefs.current.className = 'hideObject'
        aniImageLists[cIndex][3].current.setClass('hideObject')
        blackWhiteObject.current.className = 'show halfOpacity'

        if (stepCount < 7)
            aniImageLists[cIndex][3].current.setUrl('question/' + (stepCount + 2) + '/4.png')

        if (!isDisabled)
            timerList[3] = setTimeout(() => {
                isEven = !isEven
                cIndex = isEven ? 0 : 1

                audioList[qsIndex + stepCount * 2].play().catch(error => { });
                setTimeout(() => {
                    playZoomAnimation();
                }, audioList[qsIndex + stepCount * 2].duration * 1000 + 2000);
            }, 2500);
    }



    const clickAnswer = () => {
        //play answer..
        clearTimeout(timerList[3])
        clearTimeout(timerList[2])

        stopRepeatAudio()
        audioList.commonAudio2.pause();

        audioList[qsIndex + stepCount * 2 + 1].play().catch(error => { });
        buttonRefs.current.style.pointerEvents = 'none'

        setTimeout(() => {
            stepCount++
            audioList.successAudio.play().catch(error => { })

            starRefs[totalStep].current.setClass('show')
            totalStep++

            setTimeout(() => {
                audioList.successAudio.pause();
                audioList.successAudio.currentTime = 0;

                if (stepCount == firstStartNum) {
                    startFirstPart()
                    isDisabled = true;
                    setTimeout(() => {
                        returnBackground();
                    }, 2000);
                }

                else if (stepCount == firstContinueNum) {
                    continueFirstPart()
                    isDisabled = true;
                }

                else {
                    isDisabled = false;
                    if (stepCount < questionPartCount) {
                        returnBackground();
                        buttonRefs.current.style.pointerEvents = ''
                    }
                }
            }, 5000);

        }, audioList[qsIndex + stepCount * 2 + 1].duration * 1000);
    }

    //2022-3-27 modified by Cheng...

    const transSignaler = (signal) => {


        switch (signal) {
            case SIGNALLIST.startSecondPart:

                stepCount++
                startSecondPart() // start second part    
                break;

            case SIGNALLIST.loadSecondPart:
                setSecondShow(true)
                break;

            case SIGNALLIST.increaseMark:
                starRefs[totalStep].current.setClass('show')
                totalStep++;
                break;

            default:
                break;
        }
    }

    const startSecondPart = () => {

        stepCount = 0

        setPrimaryAudio(audioList[qsIndex + stepCount * 2])
        setRepeatAudio(audioList.commonAudio2)

        setTimeout(() => {

            blackWhiteObject.current.className = 'show halfOpacity'

            aniImageLists[0].map(image => {
                image.current.setClass('hideObject')
            })

            buttonRefs.current.className = 'hideObject'

            setTimeout(() => {

                audioList[qsIndex + stepCount * 2].play().catch(error => { });
                setTimeout(() => {
                    setFirstShow(true)
                    setLastLoaded(true)
                    playZoomAnimation();
                }, audioList[qsIndex + stepCount * 2].duration * 1000 + 2000);
            }, 3000);

        }, 500);



    }

    const continueFirstPart = () => {
        stopRepeatAudio()

        secondPartRef.current.className = 'disapear'
        firstPartRef.current.className = 'appear'


        optionRef.current.continueGame()
    }

    const startFirstPart = () => {
        stopRepeatAudio()

        secondPartRef.current.className = 'disapear'
        firstPartRef.current.className = 'appear'

        optionRef.current.startGame()
    }

    const continueSecondPart = () => {
        stopRepeatAudio()
        secondPartRef.current.className = 'appear'
        firstPartRef.current.className = 'disapear'
        buttonRefs.current.style.pointerEvents = ''

        setPrimaryAudio(audioList[qsIndex + stepCount * 2])
        setRepeatAudio(audioList.commonAudio2)

        timerList[3] = setTimeout(() => {
            audioList[qsIndex + stepCount * 2].play().catch(error => { });
            setTimeout(() => {
                playZoomAnimation();
            }, audioList[qsIndex + stepCount * 2].duration * 1000 + 2000);
        }, 2500);

    }

    return (
        <div>
            {
                isSceneLoad &&
                <div
                    ref={parentRef}
                    className='hideObject'>
                    <div
                        style={{
                            position: "fixed", width: _baseGeo.width + "px"
                            , height: _baseGeo.height + "px",
                            left: _baseGeo.left + 'px',
                            top: _baseGeo.top + 'px',
                            pointerEvents: 'none'
                        }}
                    >
                        {
                            isFirstShow &&
                            <div
                                style={{
                                    position: "absolute", width: '100%'
                                    , height: '100%',
                                    left: '0%',
                                    top: '0%'
                                }} >
                                <img
                                    width={'100%'}
                                    style={{
                                        position: 'absolute',
                                        left: '0%',
                                        top: '0%',

                                    }}
                                    src={prePathUrl() + "images/bg/green_bg.png"}
                                />
                            </div>
                        }

                        {
                            Array.from(Array(10).keys()).map(value =>
                                <div
                                    style={{
                                        position: "fixed", width: _geo.width * 0.05 + "px",
                                        right: _geo.width * (value * 0.042 + 0.01) + 'px'
                                        , top: 0.02 * _geo.height + 'px'
                                        , cursor: "pointer",
                                    }}>
                                    <BaseImage
                                        url={'icon/grey_progress.png'}
                                    />
                                    <BaseImage
                                        ref={starRefs[9 - value]}
                                        url={'icon/progress.png'}
                                        className='hideObject'
                                    />
                                </div>)
                        }
                    </div>

                    {
                        isSecondShow
                        &&
                        <div
                            ref={secondPartRef}
                            style={{
                                position: "fixed", width: _baseGeo.width + "px"
                                , height: _baseGeo.height + "px",
                                left: _baseGeo.left + 'px',
                                top: _baseGeo.top + 'px',
                            }}
                        >

                            <BaseImage
                                ref={baseColorImgRef}
                                url={"bg/base.png"}
                            />

                            <div
                                ref={blackWhiteObject}
                                className="halfOpacity"
                                style={{
                                    position: "absolute", width: '100%'
                                    , height: '100%',
                                    left: '0%',
                                    top: '0%',
                                    WebkitMaskImage: 'url(' + prePathUrl() + 'images/question/1/m.png)',
                                    WebkitMaskSize: '100% 100%',
                                    WebkitMaskRepeat: "no-repeat",
                                    background: 'black',

                                }} >

                            </div>



                            {
                                aniImageLists.map(
                                    (aniImageList, index) =>
                                        (index == 0 || index == 1 && isLastLoaded) &&
                                        [1, 2, 3].map(value =>
                                            <BaseImage
                                                className='hideObject'
                                                ref={aniImageList[value - 1]}
                                                scale={1}
                                                posInfo={{ l: 0, t: 0 }}
                                                url={"question/" + (index + 1) + "/" + value + ".png"}
                                            />
                                        )
                                )
                            }
                            {
                                aniImageLists.map(
                                    (aniImageList, index) =>
                                        (index == 0 || index == 1 && isLastLoaded) &&
                                        <div
                                            style={{
                                                position: "fixed", width: _geo.width * 1.3 + "px",
                                                height: _geo.height + "px",
                                                left: _geo.left - _geo.width * 0.15 + 'px'
                                                , top: _geo.top - _geo.height * 0.19 + 'px'
                                            }}>
                                            <BaseImage
                                                ref={aniImageList[3]}
                                                className='hideObject'
                                                url={"question/" + (index + 1) + "/4.png"}
                                            />
                                        </div>
                                )

                            }


                            <div ref={buttonRefs}
                                className='hideObject'
                            >
                                <div
                                    className='commonButton'
                                    onClick={clickAnswer}
                                    style={{
                                        position: "fixed", width: _geo.width * 0.1 + "px",
                                        height: _geo.width * 0.1 + "px",
                                        left: _geo.left + _geo.width * 0.445
                                        , top: _geo.top + _geo.height * 0.72
                                        , cursor: "pointer",
                                        borderRadius: '50%',
                                        overflow: 'hidden',

                                    }}>
                                    <img

                                        width={"370%"}
                                        style={{
                                            position: 'absolute',
                                            left: '-230%',
                                            top: '-32%'
                                        }}
                                        draggable={false}
                                        src={prePathUrl() + 'images/buttons/answer_button.svg'}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {
                        isFirstShow &&
                        < div
                            ref={firstPartRef}
                            className='hideObject'
                        >
                            <OptionScene
                                ref={optionRef}
                                transSignaler={transSignaler}
                                continueSecondPart={continueSecondPart}
                                nextFunc={nextFunc}
                                _baseGeo={_baseGeo}
                                _geo={_geo} />

                        </div>

                    }
                </div>
            }
        </div>
    );
});

export default Scene;

