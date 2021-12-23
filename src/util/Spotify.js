// import React from 'react';

const clientId = '8457fb4b1e8c4682bb8416fe40694366';
const redirectUri = 'http://black-and-white-bite.surge.sh';

let userAccessToken;

const  Spotify = {
    getAccessToken(){
        if (userAccessToken){
            return userAccessToken
        }

        const accessTokenMatch= window.location.href.match(/access_token=([^&]*)/)
        const expiresInMatch= window.location.href.match(/expires_in=([^&]*)/)

        if (accessTokenMatch && expiresInMatch){
            userAccessToken= accessTokenMatch[1]
            const expiresIn=Number(expiresInMatch[1])
            window.setTimeout(() => userAccessToken= '', expiresIn* 1000)
            window.history.pushState('Acess Token',null,'/')
            return userAccessToken
        }else{
            const accesUrl=`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}` 
            window.location= accesUrl;
        }
    },
    async search(term){
        const accessToken= Spotify.getAccessToken()
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
            headers: {Authorization: `Bearer ${accessToken}`},
        }).then(response =>{
            return response.json()
        }).then(jsonResponse => {
            if (!jsonResponse.tracks){
                return []
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name:track.name,
                album:track.album.name,
                artist:track.artists[0].name,
                uri:track.uri
            }))
        })
    },
    async savePlaylist(name,trackUris){
        if(!name || !trackUris) return;

        const accessToken = Spotify.getAccessToken();
        const headers={Authorization: `Bearer ${accessToken}`};
        let userID;

        return fetch("https://api.spotify.com/v1/me",{headers:headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userID = jsonResponse.id
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,{
                headers: headers, 
                method:'POST', 
                body:JSON.stringify( {name: name})}
            ).then(response => response.json()
            ).then(jsonResponse => {
                const playlistID= jsonResponse.id
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,{headers:headers,method:'POST',body:JSON.stringify({uris:trackUris})});
            })
        })
    }

}

export default Spotify;