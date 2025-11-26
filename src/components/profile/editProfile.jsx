import { getPlaceholder } from '@components/avatar/avatar.js';
import React, { useRef } from 'minireact';
import { ActionButton } from '@components/action-button/action-button.jsx';
import User from '@api/modules/user.js';


export const EditProfile = ({ placeholder, name, username, onSave }) => {
    const nameRef = useRef(null);
    const usernameRef = useRef(null);

    const handleSubmit = async () => {
        const nameValue = nameRef.current?.value ?? '';
        const usernameValue = usernameRef.current?.value ?? '';
        console.log(usernameValue)

        const updateData = {
            bio: '',
            name: nameValue.trim(),
            username: usernameValue.trim()
        }

        await User.updateMe(updateData);

        onSave();
    };

    const checkData = () => {
        const nameValue = nameRef.current?.value ?? '';
        const usernameValue = usernameRef.current?.value ?? '';

        if (app.user.name === nameValue && app.user.username === usernameValue) {
            console.log('eballlo')
        }
    }

    return (
        <div class="profile">
            {/* <div class="profile__avatar">
                {placeholder || getPlaceholder(nameRef.current?.value || name || '')}
            </div> */}

            <div class="profile__info">
                <div class="profile__name">
                    <div class="profile__icons">
                        <i class="icon user-icon icon--size-lg"></i>
                    </div>
                    <div class="input-wrapper">
                        <input
                            ref={nameRef}
                            class="editProfile-input"
                            type="text"
                            value={name || ''}
                            onInput={() => checkData()}
                            placeholder='Имя'
                        />
                    </div>
                </div>

                <div class="profile__username">
                    <div class="profile__icons">
                        <i class="icon at-icon icon--size-lg"></i>
                    </div>
                    <div class="input-wrapper">
                        <input
                            ref={usernameRef}
                            class="editProfile-input"
                            type="text"
                            value={username || ''}
                            onInput={() => checkData()}
                            placeholder='Логин'
                        />
                    </div>
                </div>
            </div>

            <ActionButton
                icon="submit"
                onClick={() => handleSubmit()}
            />
        </div>
    );
};