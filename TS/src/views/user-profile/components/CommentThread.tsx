import { Link } from 'react-router'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'

import type { CommentType } from '@/views/user-profile/types.ts'
import { basePath } from '@/helpers'

const CommentThread = ({ comments }: { comments: CommentType[] }) => {
  return (
    <div className="comments-list">
      <div className="comment-thread mb-4">
        {comments.map((comment, idx) => (
          <div className="d-flex gap-2" key={idx}>
            <img
              src={comment.user.avatar}
              className="profile-image profile-image-md rounded-circle me-2 mt-3"
              width="40"
              height="40"
              alt="Iftekhar Ahmed"
            />
            <div className="flex-grow-1">
              <div className="comment-content body-bg rounded-3 p-3 ps-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">{comment.user.name}</h6>
                  <Dropdown>
                    <DropdownToggle type="button" as={'a'} className="btn btn-icon btn-sm waves-effect no-arrow">
                      <svg className="sa-icon">
                        <use href={`${basePath}/icons/sprite.svg#more-horizontal`}></use>
                      </svg>
                    </DropdownToggle>
                    <DropdownMenu>
                      <li>
                        <DropdownItem as={Link} to="">
                          Edit
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem as={Link} to="">
                          Delete
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem as={Link} to="">
                          Report
                        </DropdownItem>
                      </li>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <p className="text-muted small mb-2">{comment.user.role}• 3rd+</p>
                <p className="mb-2">{comment.comment}</p>
                <div className="d-flex align-items-center gap-2">
                  <button type="button" className="btn btn-icon btn-default waves-effect rounded-circle">
                    <svg className="sa-icon">
                      <use href={`${basePath}/icons/sprite.svg#thumbs-up`}></use>
                    </svg>
                  </button>
                  <button type="button" className="btn btn-icon btn-default waves-effect rounded-circle">
                    <svg className="sa-icon">
                      <use href={`${basePath}/icons/sprite.svg#message-square`}></use>
                    </svg>
                  </button>
                  <span className="text-muted small">{comment.time}</span>
                </div>
              </div>
              {comment.reply && comment.reply.length > 0 && (
                <div className="comment-thread mt-3">
                  {comment.reply.map((reply, idx) => (
                    <div className="d-flex gap-2" key={idx}>
                      <img
                        src={reply.user.avatar}
                        className="profile-image profile-image-md rounded-circle me-2 mt-3"
                        width="40"
                        height="40"
                        alt="Iftekhar Ahmed"
                      />
                      <div className="flex-grow-1">
                        <div className="comment-content body-bg rounded-3 p-3 ps-0">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">{reply.user.name}</h6>
                            <Dropdown>
                              <DropdownToggle type="button" as={'a'} className="btn btn-icon btn-sm waves-effect no-arrow">
                                <svg className="sa-icon">
                                  <use href={`${basePath}/icons/sprite.svg#more-horizontal`}></use>
                                </svg>
                              </DropdownToggle>
                              <DropdownMenu>
                                <li>
                                  <DropdownItem as={Link} to="">
                                    Edit
                                  </DropdownItem>
                                </li>
                                <li>
                                  <DropdownItem as={Link} to="">
                                    Delete
                                  </DropdownItem>
                                </li>
                                <li>
                                  <DropdownItem as={Link} to="">
                                    Report
                                  </DropdownItem>
                                </li>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                          <p className="text-muted small mb-2">{reply.user.role}• 3rd+</p>
                          <p className="mb-2">{reply.comment}</p>
                          <div className="d-flex align-items-center gap-2">
                            <button type="button" className="btn btn-icon btn-default waves-effect rounded-circle">
                              <svg className="sa-icon">
                                <use href={`${basePath}/icons/sprite.svg#thumbs-up`}></use>
                              </svg>
                            </button>
                            <button type="button" className="btn btn-icon waves-effect btn-default rounded-circle">
                              <svg className="sa-icon">
                                <use href={`${basePath}/icons/sprite.svg#message-square`}></use>
                              </svg>
                            </button>
                            <span className="text-muted small">{reply.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn btn-link text-muted mt-2 p-0">
                    Load more replies
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="light" className="rounded-pill w-100">
        Load more comments
      </Button>
    </div>
  )
}

export default CommentThread
