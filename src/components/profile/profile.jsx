import { getPlaceholder } from '@components/avatar/avatar.js';
import React from 'minireact';

export const Profile = ({ placeholder, name, phone_number, username }) => {
    console.log(name, phone_number, username)
    return (
        <div class="profile">
            {/* <div class="profile__avatar">
                {placeholder || getPlaceholder(name)}
            </div> */}

            <div class="profile__name">{name}</div>

            <div class="profile__info">
                <div class="profile__phone">
                    <div class="profile__icons">
                        <i class="icon phone-icon icon--size-lg"></i>
                    </div>
                    {phone_number}
                </div>

                <div class="profile__username">
                    <div class="profile__icons">
                        <i class="icon at-icon icon--size-lg"></i>
                    </div>
                    {username}
                </div>
            </div>
        </div>
    );
};

