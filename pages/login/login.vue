<template>
  <view class="login-page">
    <!-- 手机号登录暂时不可用，使用二维码登录 -->
    <!-- <uni-card style="width: 100%" title="手机号登录" is-shadow>
      <view class="login-card">
        <view class="login-input">
          <text class="text">手机号</text>
          <input
            class="input"
            v-model="phone"
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
            @input="phoneInput"
          />
        </view>
        <view class="login-input">
          <input
            class="input"
            v-model="code"
            type="number"
            placeholder="请输入验证码"
            maxlength="6"
            @input="codeInput"
          />
          <button
            size="mini"
            :disabled="sendCodeDisabled"
            style="margin-left: 5px"
            type="primary"
            @click="sendCode"
          >
            {{ sendBtnText }}
          </button>
        </view>
        <button
          class="login-btn"
          @click="login"
          :disabled="loginBtnDisabled"
          type="primary"
        >
          登录
        </button>
      </view>
    </uni-card> -->
    <view class="login-card">
      <image style="width: 400rpx; height: 400rpx" :src="qrCodeBase64"></image>
      <view>{{ qrStatus }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user.js";
import { captchaSent, loginCellphone, qrKey, qrCreate, qrCheck } from "@/api/user.js";

const user = useUserStore();

const qrKeyStr = ref();
const qrCodeBase64 = ref();
const qrInterval = ref();
const qrStatus = ref("请打开云音乐 APP 扫码登录");
const phone = ref();
const code = ref();
const sendCodeDisabled = ref(true);
const loginBtnDisabled = ref(true);
const sendBtnText = ref("发送");

onLoad(async () => {
  const { data } = await qrKey();
  console.log(data);
  qrKeyStr.value = data.unikey;
  const res = await qrCreate(qrKeyStr.value);
  qrCodeBase64.value = res.data.qrimg;
  checkQrStatus();
});

onUnload(() => {
  clearInterval(qrInterval.value);
});

const checkQrStatus = async () => {
  qrInterval.value = setInterval(async () => {
    const res = await qrCheck(qrKeyStr.value);
    console.log(res);
    switch (res.code) {
      case 800: // 二维码过期
        qrStatus.value = "二维码已过期";
        clearInterval(qrInterval.value);
        break;
      case 801: // 等待扫码
        qrStatus.value = "请打开云音乐 APP 扫码登录";
        break;
      case 802: // 已扫描
        qrStatus.value = "已扫描，请确认登录";
        break;
      case 803: // 已确认登录
        clearInterval(qrInterval.value);
        uni.setStorageSync("cookie", res.cookie);
        await user.getUserInfo();
        uni.navigateBack();
        break;
    }
  }, 1000);
};

const sendCode = () => {
  console.log(phone.value);
  captchaSent(phone.value).then((res) => {
    console.log(res);
    sendCodeDisabled.value = true;
    let time = 60;
    sendBtnText.value = `${time}s`;
    const timer = setInterval(() => {
      time--;
      sendBtnText.value = `${time}s`;
      if (time === 0) {
        clearInterval(timer);
        sendBtnText.value = "发送";
        sendCodeDisabled.value = false;
      }
    }, 1000);
  });
};

const login = () => {
  loginCellphone(phone.value, code.value).then((res) => {
    console.log(res);
    if (res.code !== 200) {
      uni.showToast({
        title: res.msg,
        icon: "error",
      });
      return;
    }
    uni.showToast({
      title: "登录成功",
      icon: "success",
    });
    user.isLogin = true;
    user.id = res.account.id;
    user.nickname = res.profile.nickname;
    user.getUserInfo();
    uni.setStorageSync("cookie", res.cookie);
    uni.navigateBack();
  });
};

const phoneInput = (e) => {
  if (e.detail.value.length === 11) {
    sendCodeDisabled.value = false;
  } else {
    sendCodeDisabled.value = true;
  }
};
const codeInput = (e) => {
  if (e.detail.value.length === 4 && phone.value.length === 11) {
    loginBtnDisabled.value = false;
  } else {
    loginBtnDisabled.value = true;
  }
};
</script>

<style lang="scss">
.login-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  .login-input {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 50rpx;

    .text {
      width: 120rpx;
      font-size: 28rpx;
      color: #000;
    }
    .input {
      flex: 1;
    }
  }
  .login-btn {
    width: 100%;
    margin-top: 100rpx;
  }
}
</style>
