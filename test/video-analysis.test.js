import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceAnalysisFps, seekVideo, waitForVideoReady } from '../src/video-analysis.js';

class FakeVideo extends EventTarget { constructor({readyState=1,duration=2,currentTime=0}={}){super();this.readyState=readyState;this.duration=duration;this.currentTime=currentTime;} }
test('device-aware FPS lowers analysis load on iPhone and iPad',()=>{assert.equal(deviceAnalysisFps({userAgent:'iPhone',maxTouchPoints:5}),6);assert.equal(deviceAnalysisFps({userAgent:'iPad',maxTouchPoints:5}),8);assert.equal(deviceAnalysisFps({userAgent:'Macintosh',maxTouchPoints:5}),8);assert.equal(deviceAnalysisFps({userAgent:'Chrome',maxTouchPoints:0}),12)});
test('zero-second and unchanged seeks do not wait for a seeked event',async()=>{const video=new FakeVideo();await seekVideo(video,0,10);video.currentTime=1;await seekVideo(video,1,10);assert.equal(video.currentTime,1)});
test('seek timeout rejects instead of waiting forever',async()=>{const video=new FakeVideo();await assert.rejects(seekVideo(video,1,5),/タイムアウト/)});
test('seek resolves on seeked and clamps to the playable duration',async()=>{const video=new FakeVideo();const pending=seekVideo(video,5,50);queueMicrotask(()=>video.dispatchEvent(new Event('seeked')));await pending;assert.equal(video.currentTime,1.999)});
test('waitForVideoReady handles ready, metadata, errors, and timeouts',async()=>{await waitForVideoReady(new FakeVideo(),5);const loading=new FakeVideo({readyState:0,duration:NaN});const pending=waitForVideoReady(loading,50);loading.duration=3;loading.dispatchEvent(new Event('loadedmetadata'));await pending;const broken=new FakeVideo({readyState:0,duration:NaN});const failed=waitForVideoReady(broken,50);broken.dispatchEvent(new Event('error'));await assert.rejects(failed,/Safari/);await assert.rejects(waitForVideoReady(new FakeVideo({readyState:0,duration:NaN}),5),/タイムアウト/)});
