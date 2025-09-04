
export default function sendToHotJar(request) {

    if(typeof request.entity_Id === 'undefined' || typeof window.hj === 'undefined') {
        return;
    }

    window.hj('identify', request.entity_Id, request);
    console.log('HotJar:', request);

}