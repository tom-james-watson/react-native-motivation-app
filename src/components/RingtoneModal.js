import React, { Component, PropTypes } from 'react'
import { Linking } from 'react-native';
import { connect } from 'react-redux'
import tts from 'react-native-android-speech'
import store from '../store'
import { Modal, Text } from '../components'
import { createRingtoneModalDismissPressed } from '../store/navigation/actions'
import { createSnoozePressed } from '../store/alarm/actions'
import { getRingtoneModalVisible } from '../store/selectors'

class RingtoneModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)
    this.onSnooze = this.onSnooze.bind(this)
    this.onDismiss = this.onDismiss.bind(this)
  }

  speak() {
    const greetings = ["Good morning Tom.", "Morning Tom.", "Hey there Tom.", "A very good morning to you Tom.", "Rise and shine Tom!", "Hello Tom.", "Greetings Tom.", "I know, I hate mornings too."]
    const greeting = greetings[Math.floor(greetings.length * Math.random())]
    const phrases = [{text: greeting, pitch: 1.5}]
    this.getWeather(phrases)
  }

  greet(phrases) {
    console.log({phrases})

    const goodbyes = ["Have a great day Tom.", "I hope you have a pleasant day Tom.", "Don't work too hard today Tom!", "Have a lovely day Tom.", "Have a nice day Tom."]
    const goodbye = goodbyes[Math.floor(goodbyes.length * Math.random())]
    phrases.push({text: "That's it from me for now", pitch: 1, delay: 1})
    phrases.push({text: goodbye, pitch: 1.2, delay: 1})

    function speakPhrase() {
      console.log({length: phrases.length})
      if (!phrases.length > 0) {
        Linking.openURL('https://www.artpip.com/live');
        return
      }

      tts.isSpeaking()
        .then(isSpeaking=>{

          console.log({isSpeaking: isSpeaking})

          if (isSpeaking) {
            console.log('waiting 100ms')
            setTimeout(speakPhrase, 100)
            return
          }

          const phrase = phrases.shift()

          console.log('speaking:', phrase)

          const delay = phrase.delay || 0

          setTimeout(() => {
            tts.speak({
              text: phrase.text, // Mandatory
              pitch: phrase.pitch, // Optional Parameter to set the pitch of Speech,
              forceStop: true , //  Optional Parameter if true , it will stop TTS if it is already in process
              language: 'en', // Optional Paramenter Default is en you can provide any supported lang by TTS
              country: 'US' // Optional Paramenter Default is null, it provoques that system selects its default
            }).then(isSpeaking=>{
              speakPhrase()
            }).catch(error=>{
              console.error(error)
            })
          }, delay * 1000)

        })
    }

    speakPhrase()
  }

  getWeather(phrases) {

    done = true

    fetch("https://api.darksky.net/forecast/63be00b154abae19f74aa8ad4cd23196/40.4168,-3.7038", {method: "GET"})
      .then((response) => {
        console.log({response: response})
        return response.json()
      })
      .then((data) => {
        console.log({data: data})

        let maxTemp = 0

        for (const hour of data.hourly.data) {
          if (hour.temperature > maxTemp) {
            maxTemp = hour.temperature
          }
        }

        maxTemp = Math.round((maxTemp - 32) * 5/9)

        phrases.push({text: "Today's weather forecast is", pitch: 1.2, delay: 2})
        phrases.push({text: data.hourly.summary + ", with a maximum temperature of " + maxTemp + " celsius", pitch: 1})
        this.getHeadlines(phrases)
      })
      .catch((error) => {
        console.warn('fetch error', error, arguments)
      })

  }

  getHeadlines(phrases) {

    fetch("https://newsapi.org/v1/articles?source=the-guardian-uk&sortBy=top&apiKey=eb2e8978191949268284f3a7e416a6ee", {method: "GET"})
      .then((response) => {
        console.log({response: response})
        return response.json()
      })
      .then((data) => {
        console.log({data: data})

        phrases.push({text: "Here are today's headlines:", pitch: 1.2, delay: 2})

        let count = 0

        for (const article of data.articles) {
          count += 1
          if (count > 5) {
            break
          }

          phrases.push({text: article.title, pitch: 1.2, delay: 1})
          phrases.push({text: article.description, pitch: 1})
        }

        this.greet(phrases)

      })
  }

  onDismiss() {
    setTimeout(() => {
      this.speak()
    }, 100)
    // eslint-disable-next-line
    store.dispatch(createRingtoneModalDismissPressed())
  }

  onSnooze() {
    // eslint-disable-next-line
    this.props.dispatchSnoozePressed()
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title="Alarm"
        onDismiss={this.onDismiss}
        dismissText="Stop"
        onSubmit={this.onSnooze}
        submitText="Snooze"
      >
        <Text>Stop or snooze the alarm.</Text>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  visible: getRingtoneModalVisible(state),
})

const mapDispatchToProps = dispatch => ({
  dispatchRingtoneModalDismissPressed: () => dispatch(createRingtoneModalDismissPressed()),
  dispatchSnoozePressed: () => dispatch(createSnoozePressed()),
})

export default connect(mapStateToProps, mapDispatchToProps)(RingtoneModal)
