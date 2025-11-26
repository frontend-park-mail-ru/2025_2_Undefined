import { getPlaceholder } from '@components/avatar/avatar.js';
import React from 'minireact';

export const GroupInfoModal = ({ 
    placeholder, 
    name, 
    description, 
    members = [],
    onClose,
    isChannel = false 
}) => {
    return (
        <div class="modal-overlay" onClick={onClose}>
            <div 
                class="modal-dialog group-info-modal" 
                role="dialog" 
                aria-modal="true" 
                aria-label={`Информация о ${isChannel ? 'канале' : 'группе'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок модального окна */}
                <div class="modal-header">
                    <h2>{isChannel ? 'Информация о канале' : 'Информация о группе'}</h2>
                </div>

                {/* Основной контент */}
                <div class="modal-body group-info-body">
                    {/* Аватар и название */}
                    <div class="group-info-avatar-section">
                        <div class="group-info-avatar">
                            {placeholder || getPlaceholder(name)}
                        </div>
                        <div class="group-info-name">{name}</div>
                    </div>

                    {/* Описание */}
                    {/* <div class="group-info-field">
                        <div class="group-info-label">
                            <i class="icon info-icon"></i>
                        </div>
                        <div class="group-info-value">
                            {description || 'Описание отсутствует'}
                        </div>
                    </div> */}

                    {/* Участники */}
                    {/* <div class="group-info-field">
                        <div class="group-info-label">
                            <i class="icon users-icon"></i>
                            Участники ({members.length})
                        </div>
                        <div class="group-info-members">
                            {members.length > 0 ? (
                                <div class="members-list">
                                    {members.map((member, index) => (
                                        <div key={index} class="member-item">
                                            <div class="member-avatar">
                                                {getPlaceholder(member.name)}
                                            </div>
                                            <div class="member-info">
                                                <div class="member-name">{member.name}</div>
                                                {member.role && (
                                                    <div class="member-role">{member.role}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div class="no-members">Нет участников</div>
                            )}
                        </div>
                    </div> */}
                </div>

                {/* Футер с кнопкой закрытия */}
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-primary"
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};