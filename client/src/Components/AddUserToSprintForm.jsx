import React from 'react';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';

import api from '../api';


class AddUserToSprintForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sprint_id: props.sprint_id,
      username: '',
      users: [],
      status: 0, // display what when the menu is showing? 0 - not submitted, 1 - pending, 2 - success, 3 - failed
    };
    this.userChange = this.userChange.bind(this);
    // this.etaChange = this.etaChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.reload = this.reload.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  deleteUser(user_id) {
    const sprint_id = this.state.sprint_id;

    this.setState({ status: 1 });
    api.removeUserFromSprint({ sprint_id, user_id })
      .then((res) => {
        if (!res) {
          this.setState({ status: 3 });
          return;
        }
        this.setState({ status: 2 },
          this.reload());
      })
      .catch(err => console.log('err'));
  }


  componentWillUpdate(nextProps) {
    if (nextProps.sprint_id !== this.state.sprint_id) {
      this.setState({ sprint_id: nextProps.sprint_id, users: [] }, () => this.reload());
    }
  }

  componentWillMount() {
    this.reload();
  }

  reload() {
    api.getUsersInSprint(this.state.sprint_id)
      .then(users => this.setState({ users }));
  }

  onSubmit(e) {
    e.preventDefault();

    // sprint id passed down via props
    this.setState({ status: 1 });

    api.addUserToSprint({
      username: this.state.username, sprint_id: this.props.sprint_id,
    }).then((res) => {
      if (!res) {
        this.setState({ status: 3 });
        return;
      }
      this.setState({ status: 2, username: '' },
        this.reload());
    });
  }

  userChange(e) {
    e.preventDefault();
    this.setState({ username: e.target.value });
  }

  render() {
    let interior = (
      <div>
        <TextField required id="user" label="User" value={this.state.username} margin="normal" onChange={this.userChange} />
        <Button type="submit">
          Add
        </Button>

      </div>
    );

    if (this.state.status === 1) {
      interior = (
        <div>
          Saving...
        </div>
      );
    }
    if (this.state.status === 2) {
      interior = (
        <div>
          Success!
        </div>
      );
      setTimeout(() => {
        this.setState({ status: 0, title: '' });
      }, 1000);
    }
    if (this.state.status === 3) {
      interior = (
        <div>
          Failed!
        </div>
      );
      setTimeout(() => {
        this.setState({ status: 0 });
      }, 1000);
    }
    return (
      <div>
        <CardContent style={{ padding: '5px', textAlign: 'center' }}>
          <form onSubmit={this.onSubmit}>
            {interior}
          </form>
          <div>
          USERS IN THIS SPRINT
          </div>
          <div>
            {this.state.users.map((user, i) => (
              <div key={i}>
                {`${user.username}  `}
                <button onClick={() => this.deleteUser(user.id)}>
                  X
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    );
  }
}

export default AddUserToSprintForm;