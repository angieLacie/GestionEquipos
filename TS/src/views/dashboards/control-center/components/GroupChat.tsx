import SimplebarClient from '@/components/client-wrappers/SimplebarClient.tsx'

import groupChatThumb from '@/assets/img/thumbs/pic-4.png'
import avatarB from '@/assets/img/demo/avatars/avatar-b.png'
import avatarC from '@/assets/img/demo/avatars/avatar-c.png'
import { Button, Dropdown, DropdownMenu, DropdownToggle, OverlayTrigger, Tooltip } from 'react-bootstrap'
import SoundWave from '@/components/SoundWave.tsx'
import { Link } from 'react-router'
import { basePath } from '@/helpers'

const GroupChat = () => {
  return (
    <div id="panel-2" className="panel panel-icon">
      <div className="panel-container">
        <div className="d-flex flex-grow-1 p-0 w-100 h-100">
          <div className="d-flex flex-column flex-grow-1 flex-0 overflow-x-auto h-100" style={{ minHeight: 599 }}>
            <div className="d-flex align-items-center p-0 border-faded border-top-0 border-start-0 border-end-0 flex-shrink-0">
              <div className="d-flex align-items-center w-100 ps-3 px-lg-3 py-2 position-relative">
                <div className="d-flex flex-row align-items-center mt-1 mb-1">
                  <div className="me-2 d-inline-block">
                    <span className="d-block position-relative">
                      <img src={groupChatThumb} alt="" className="rounded profile-image profile-image-md" />
                    </span>
                  </div>
                  <div className="info-card-text">
                    <div className="text-truncate text-truncate-lg">Group Chat</div>
                    <small className="text-muted text-truncate text-truncate-md">7 online</small>
                  </div>
                </div>
                <div className="d-flex flex-row gap-2 ms-auto">
                  <Link to="" data-toggle="button" className="btn btn-icon rounded-circle waves-effect" aria-label="Phone">
                    <svg className="sa-icon sa-icon-2x sa-bold sa-icon-subtlelight">
                      <use href={`${basePath}/icons/sprite.svg#phone`}></use>
                    </svg>
                  </Link>
                  <Link to="" className="btn btn-icon rounded-circle waves-effect" aria-label="Video">
                    <svg className="sa-icon sa-icon-2x sa-bold sa-icon-subtlelight sa-nofill">
                      <use href={`${basePath}/icons/sprite.svg#video`}></use>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex-wrap align-items-center flex-grow-1 position-relative bg-gray-50">
              <div className="msgr position-absolute top-0 bottom-0 w-100 overflow-hidden d-flex flex-column">
                <SimplebarClient
                  id="chat_container"
                  style={{ height: 'calc(100% - 150px)' }}
                  className=" w-100 p-4 px-lg-3 bg-subtlelight-fade  flex-grow-1">
                  <div className="chat-segment chat-segment-sent">
                    <div className="chat-message px-2 py-2 fs-sm">
                      <p>
                        <span className="fw-bold">@OliverKopyov</span>, can you please check the files? Make sure to analyze the solution <br />
                        and create a report.
                      </p>
                    </div>
                    <div className="text-end fw-300 text-muted mt-1 fs-xs">3:00 pm</div>
                  </div>

                  <div className="chat-segment chat-segment-get position-relative">
                    <span
                      className="rounded-circle profile-image profile-image-sm d-block position-absolute me-2 mt-1"
                      style={{
                        backgroundImage: `url(${avatarB})`,
                        backgroundSize: 'cover',
                        left: 0,
                      }}></span>
                    <div className="chat-message bg-warning bg-opacity-10 px-2 py-2 fs-sm ms-5">
                      <p>
                        <span className="d-block fw-600 fs-xs mb-2">Oliver Kopyov</span>
                        Hi, Sorry going through a busy time in office. Yes I analyzed the solution. It will require some resource, which I could not
                        manage.
                      </p>
                    </div>
                    <div className="fw-300 text-muted mt-1 fs-xs ms-5"> 3:24 pm</div>
                  </div>

                  <div className="chat-segment chat-segment-sent chat-start">
                    <div className="chat-message px-2 py-2 fs-sm">
                      <p>Okay</p>
                    </div>
                  </div>
                  <div className="chat-segment chat-segment-sent chat-end">
                    <div className="chat-message px-2 py-2 fs-sm">
                      <p>@GeraldChait, can you please help @OliverKopyov with the report?</p>
                    </div>
                    <div className="text-end fw-300 text-muted mt-1 fs-xs">3:26 pm</div>
                  </div>

                  <div className="chat-segment chat-segment-get chat-start position-relative">
                    <span
                      className="rounded-circle profile-image profile-image-sm d-block position-absolute me-2 mt-1"
                      style={{
                        backgroundImage: `url(${avatarC})`,
                        backgroundSize: 'cover',
                        left: 0,
                      }}></span>
                    <div className="chat-message bg-info bg-opacity-10 px-2 py-2 fs-sm ms-5">
                      <p>
                        <span className="d-block fw-600 fs-xs mb-2">Melissa Emma Ayre</span>
                        I can help you out
                        <br />
                        Can you send the related files?
                      </p>
                    </div>
                  </div>
                  <div className="chat-segment chat-segment-get mb-3 chat-end">
                    <div className="chat-message bg-info bg-opacity-10 px-2 py-2 fs-sm ms-5">
                      <button
                        type="button"
                        aria-label="Play sound"
                        className="btn btn-sm btn-outline-secondary p-1 position-absolute translate-middle top-50 start-0 ms-4"
                        data-action="playsound"
                        data-soundpath="media/sound/"
                        data-soundfile="demo-emma.mp3">
                        <svg className="sa-icon">
                          <use href={`${basePath}/icons/sprite.svg#play`}></use>
                        </svg>
                      </button>
                      <div className="sound-image ms-5">
                        <SoundWave />
                      </div>
                    </div>
                    <div className="fw-300 text-muted mt-1 fs-xs ms-5"> 3:29 pm</div>
                  </div>

                  <div className="chat-segment chat-segment-get chat-start position-relative">
                    <span
                      className="rounded-circle profile-image profile-image-sm d-block position-absolute me-2 mt-1"
                      style={{
                        backgroundImage: `url(${avatarB})`,
                        backgroundSize: 'cover',
                        left: 0,
                      }}></span>
                    <div className="chat-message bg-warning bg-opacity-10 px-2 py-2 fs-sm ms-5">
                      <p>
                        <span className="d-block fw-600 fs-xs mb-2">Oliver Kopyov</span>
                      </p>
                      <div className="position-relative">
                        <button
                          type="button"
                          aria-label="Play sound"
                          className="btn btn-sm btn-outline-secondary p-1 position-absolute translate-middle top-50 start-0 ms-3"
                          data-action="playsound"
                          data-soundpath="media/sound/"
                          data-soundfile="demo-bryan.mp3">
                          <svg className="sa-icon">
                            <use href={`${basePath}/icons/sprite.svg#play`}></use>
                          </svg>
                        </button>
                        <div className="sound-image ms-5">
                          <SoundWave />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chat-segment chat-segment-get chat-end mb-3">
                    <div className="chat-message bg-warning bg-opacity-10 px-2 py-2 fs-sm ms-5">
                      <div className="d-flex flex-wrap align-items-center gap-2 py-0 position-relative if-empty-display-none">
                        <div className="alert m-0 p-0 badge bg-primary-50 border-primary ps-2">
                          security_codes.pdf
                          <button
                            type="button"
                            aria-label="Download"
                            className="btn btn-icon btn-xs ms-1 rounded-0 border border-primary border-top-0 border-bottom-0 border-end-0 waves-effect waves-themed">
                            <i className="sa sa-arrow-down"></i>
                          </button>
                        </div>
                        <div className="alert m-0 p-0 badge bg-primary-50 border-primary ps-2">
                          agreement.pdf
                          <button
                            type="button"
                            aria-label="Download"
                            className="btn btn-icon btn-xs ms-1 rounded-0 border border-primary border-top-0 border-bottom-0 border-end-0 waves-effect waves-themed">
                            <i className="sa sa-arrow-down"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="fw-300 text-muted mt-1 fs-xs ms-5"> 3:33 pm</div>
                  </div>

                  <div className="chat-segment chat-segment-get position-relative">
                    <span
                      className="rounded-circle profile-image profile-image-sm d-block position-absolute me-2 mt-1"
                      style={{
                        backgroundImage: `url(${avatarC})`,
                        backgroundSize: 'cover',
                        left: 0,
                      }}></span>
                    <div className="chat-message bg-info bg-opacity-10 px-2 py-2 fs-sm ms-5 pb-0">
                      <span className="d-block fw-600 fs-xs mb-2">Melissa Emma Ayre</span>
                      <div className="emoji emoji--like">
                        <div className="emoji__hand">
                          <div className="emoji__thumb"></div>
                        </div>
                      </div>
                    </div>
                    <div className="fw-300 text-muted mt-1 fs-xs ms-5"> Just now</div>
                  </div>

                  <div className="chat-segment chat-segment-sent chat-start">
                    <div className="chat-message px-2 py-2 fs-sm">
                      <p>Thanks Melissa!</p>
                    </div>
                  </div>
                </SimplebarClient>

                <div className="panel-content border-faded border-start-0 border-end-0 border-bottom-0 bg-faded">
                  <textarea
                    rows={2}
                    className="form-control px-2 rounded-top border-bottom-start-radius-0 border-bottom-end-radius-0"
                    placeholder="write a reply..."></textarea>
                  <div className="d-flex align-items-center py-1 px-2 border border-top-0 rounded-bottom">
                    <div className="d-flex gap-1 flex-row align-items-center flex-wrap flex-shrink-0">
                      <Dropdown>
                        <DropdownToggle
                          as={'button'}
                          className="btn btn-icon fs-xl waves-effect no-arrow"
                          type="button"
                          aria-label="Emoji"
                          aria-expanded="false">
                          <svg className="sa-icon sa-bold sa-icon-subtlelight">
                            <use href={`${basePath}/icons/sprite.svg#smile`}></use>
                          </svg>
                        </DropdownToggle>
                        <DropdownMenu className="text-center rounded-pill overflow-hidden" data-popper-placement="top-start">
                          <div className="d-flex align-items-center px-2 py-0 gap-1">
                            <OverlayTrigger overlay={<Tooltip>Like</Tooltip>}>
                              <Link to="" className="emoji emoji--like">
                                <div className="emoji__hand">
                                  <div className="emoji__thumb"></div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Love</Tooltip>}>
                              <Link to="" className="emoji emoji--love">
                                <div className="emoji__heart"></div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Haha</Tooltip>}>
                              <Link to="" className="emoji emoji--haha">
                                <div className="emoji__face">
                                  <div className="emoji__eyes"></div>
                                  <div className="emoji__mouth">
                                    <div className="emoji__tongue"></div>
                                  </div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Yay</Tooltip>}>
                              <Link to="" className="emoji emoji--yay">
                                <div className="emoji__face">
                                  <div className="emoji__eyebrows"></div>
                                  <div className="emoji__mouth"></div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Wow</Tooltip>}>
                              <Link to="" className="emoji emoji--wow">
                                <div className="emoji__face">
                                  <div className="emoji__eyebrows"></div>
                                  <div className="emoji__eyes"></div>
                                  <div className="emoji__mouth"></div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Sad</Tooltip>}>
                              <Link to="" className="emoji emoji--sad">
                                <div className="emoji__face">
                                  <div className="emoji__eyebrows"></div>
                                  <div className="emoji__eyes"></div>
                                  <div className="emoji__mouth"></div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Angry</Tooltip>}>
                              <Link to="" className="emoji emoji--angry">
                                <div className="emoji__face">
                                  <div className="emoji__eyebrows"></div>
                                  <div className="emoji__eyes"></div>
                                  <div className="emoji__mouth"></div>
                                </div>
                              </Link>
                            </OverlayTrigger>
                          </div>
                        </DropdownMenu>
                      </Dropdown>
                      <button
                        className="btn btn-icon fs-xl flex-shrink-0 waves-effect"
                        type="button"
                        aria-label="Attach Files or Photos"
                        data-bs-toggle="tooltip"
                        data-bs-original-title="Attach Files or Photos"
                        data-bs-placement="top">
                        <svg className="sa-icon sa-bold sa-icon-subtlelight">
                          <use href={`${basePath}/icons/sprite.svg#file`}></use>
                        </svg>
                      </button>
                      <button
                        className="btn btn-icon fs-xl width-1 flex-shrink-0 waves-effect"
                        type="button"
                        aria-label="Voice"
                        data-bs-toggle="tooltip"
                        data-bs-original-title="Voice"
                        data-bs-placement="top">
                        <svg className="sa-icon sa-bold sa-icon-subtlelight">
                          <use href={`${basePath}/icons/sprite.svg#mic`}></use>
                        </svg>
                      </button>
                    </div>
                    <Button variant="primary" className="btn-xs ms-auto waves-effect" aria-label="Reply">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupChat
