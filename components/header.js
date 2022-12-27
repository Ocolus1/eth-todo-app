import { useState, useEffect } from "react";

export default function Header(props) {
	const [account, setAccount] = useState("");

	useEffect(() => {
		setAccount(shortenAddress(props.account));
	}, [props.account]);

	function shortenAddress(address) {
		return `${address.substring(0, 4)}...${address.substring(40)}`;
	}

	return (
		<nav className="navbar navbar-expand-lg bg-body-tertiary">
			<div className="container">
				<a className="navbar-brand" href="#">
					CRYPTO TODOLIST
				</a>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNavAltMarkup"
					aria-controls="navbarNavAltMarkup"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNavAltMarkup">
					<div className="navbar-nav ms-auto">
						<a className="nav-link active" aria-current="page" href="#">
							{account == "" ?
								<button className="btn btn-dark rounded-pill"
								onClick={props.connectToMetamask}
								>Connect Wallet</button>
								:	
								<button className="btn btn-dark rounded-pill">Connected {account}</button>
							}
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}
